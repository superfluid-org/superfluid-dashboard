import { ApiKeyStamper } from '@turnkey/api-key-stamper';
import type { Hex } from 'viem';

import appConfig from '../../../utils/config';
import { resolvePopupParams } from './resolvePopupParams';

const STORAGE_KEY = 'SF:HFA:dashboardRequester';
const TURNKEY_SIGN_TRANSACTION_PATH = '/public/v1/submit/sign_transaction';
const TURNKEY_SIGN_TRANSACTION_TYPE = 'ACTIVITY_TYPE_SIGN_TRANSACTION_V2';
const TURNKEY_ETHEREUM_TRANSACTION_TYPE = 'TRANSACTION_TYPE_ETHEREUM';
const TURNKEY_CONSENSUS_NEEDED_STATUS = 'ACTIVITY_STATUS_CONSENSUS_NEEDED';
const HFA_AGENT_LABEL = 'Superfluid Dashboard';
const P256_SCALAR_BYTE_LENGTH = 32;

type JsonWebKeyWithPrivate = JsonWebKey & { d: string; x: string; y: string };

interface DashboardHfaState {
  version: 1;
  enabled: boolean;
  hfaUrl: string;
  agentPublicKey: string;
  agentPrivateJwk: JsonWebKeyWithPrivate;
  agentPrivateKeyHex?: string;
  setupSessionId?: string;
  setupUrl?: string;
  walletAddress?: string;
}

interface HfaSetupSession {
  setupSessionId: string;
  status: 'pending' | 'completed' | 'expired';
  setupUrl?: string;
  walletAddress?: string;
  agentPublicKey?: string;
}

interface HfaDraftResponse {
  draftId: string;
  subOrganizationId: string;
  intent: HfaIntent;
  turnkeyTransaction: {
    signWith: string;
    unsignedTransaction: string;
  };
}

interface HfaRequestResponse {
  requestId: string;
  status: HfaRequestStatus;
  txHash: string | null;
  error: string | null;
}

type HfaRequestStatus =
  | 'pending_human'
  | 'rejected_by_human'
  | 'approving'
  | 'approval_failed'
  | 'signing_failed'
  | 'broadcast_failed'
  | 'executed';

interface HfaIntent {
  actions: [{
    chainId: number;
    to: string;
    data: string;
    value: string;
  }];
}

type RpcTransaction = Record<string, string | undefined>;

function getApiBase(): string {
  return `${appConfig.hfa.url.replace(/\/$/, '')}/api`;
}

function addressesEqual(left?: string, right?: string): boolean {
  return Boolean(left && right && left.toLowerCase() === right.toLowerCase());
}

function unbindDashboardHfaWallet(state: DashboardHfaState): DashboardHfaState {
  return {
    ...state,
    enabled: false,
    walletAddress: undefined,
    setupSessionId: undefined,
    setupUrl: undefined,
  };
}

function normalizeScalarBytes(bytes: Uint8Array): Uint8Array {
  if (bytes.length === P256_SCALAR_BYTE_LENGTH) return bytes;
  if (bytes.length > P256_SCALAR_BYTE_LENGTH) {
    throw new Error('HFA agent private key is invalid');
  }
  const padded = new Uint8Array(P256_SCALAR_BYTE_LENGTH);
  padded.set(bytes, P256_SCALAR_BYTE_LENGTH - bytes.length);
  return padded;
}

function privateKeyHexFromJwk(jwk: JsonWebKeyWithPrivate): string {
  return bytesToHex(normalizeScalarBytes(base64UrlToBytes(jwk.d)));
}

function normalizeDashboardHfaState(state: DashboardHfaState): DashboardHfaState {
  const derivedPublicKey = compressedPublicKeyFromJwk(state.agentPrivateJwk);
  const agentPrivateKeyHex = state.agentPrivateKeyHex ?? privateKeyHexFromJwk(state.agentPrivateJwk);
  const keysMatch = derivedPublicKey === state.agentPublicKey;
  return {
    ...state,
    agentPrivateKeyHex,
    enabled: keysMatch ? state.enabled : false,
    walletAddress: keysMatch ? state.walletAddress : undefined,
  };
}

export function dashboardHfaAgentKeysMatch(state: DashboardHfaState | null): boolean {
  if (!state) return false;
  return compressedPublicKeyFromJwk(state.agentPrivateJwk) === state.agentPublicKey;
}

function assertConsistentAgentKeys(state: DashboardHfaState): void {
  if (!dashboardHfaAgentKeysMatch(state)) {
    throw new Error(
      'HFA agent keys in this browser no longer match. Reset HFA keys in the account modal and complete setup again.'
    );
  }
}

function setStoredState(state: DashboardHfaState): DashboardHfaState {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  return state;
}

export function clearDashboardHfaState(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Keep dashboard HFA state aligned with the connected Superfluid Wallet.
 * Clears all HFA state on disconnect; disables setup when the address changes.
 */
export function syncDashboardHfaWithWallet(connectedWalletAddress?: string): void {
  if (!connectedWalletAddress) {
    clearDashboardHfaState();
    return;
  }

  const state = getStoredState();
  if (!state) return;

  const boundToAnotherWallet = Boolean(
    state.walletAddress && !addressesEqual(state.walletAddress, connectedWalletAddress)
  );
  const pendingSetupForAnotherWallet = Boolean(
    !state.enabled &&
    state.setupSessionId &&
    state.walletAddress &&
    !addressesEqual(state.walletAddress, connectedWalletAddress)
  );

  if (state.enabled && boundToAnotherWallet) {
    setStoredState(unbindDashboardHfaWallet(state));
    return;
  }

  if (pendingSetupForAnotherWallet) {
    setStoredState(unbindDashboardHfaWallet(state));
  }
}

export function getDashboardHfaState(): DashboardHfaState | null {
  return getStoredState();
}

function getStoredState(): DashboardHfaState | null {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as DashboardHfaState;
    if (parsed.version !== 1 || !parsed.agentPublicKey || !parsed.agentPrivateJwk) {
      return null;
    }
    return normalizeDashboardHfaState(parsed);
  } catch {
    return null;
  }
}

export function isDashboardHfaReady(walletAddress?: string): boolean {
  const state = getStoredState();
  if (!appConfig.hfa.enabled || !state?.enabled) return false;
  return Boolean(
    walletAddress &&
    state.walletAddress &&
    state.walletAddress.toLowerCase() === walletAddress.toLowerCase()
  );
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = `${value}${'='.repeat((4 - value.length % 4) % 4)}`;
  if (typeof atob === 'function') {
    return Uint8Array.from(atob(padded.replace(/-/g, '+').replace(/_/g, '/')), (char) =>
      char.charCodeAt(0)
    );
  }
  const buffer = (globalThis as unknown as {
    Buffer?: { from: (value: string, encoding: string) => Uint8Array };
  }).Buffer;
  if (!buffer) throw new Error('No base64 decoder available');
  return Uint8Array.from(buffer.from(padded, 'base64url'));
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function compressedPublicKeyFromJwk(jwk: JsonWebKeyWithPrivate): string {
  const x = base64UrlToBytes(jwk.x);
  const y = base64UrlToBytes(jwk.y);
  const yIsOdd = (y[y.length - 1] & 1) === 1;
  return `${yIsOdd ? '03' : '02'}${bytesToHex(x)}`;
}

async function generateDashboardRequesterState(): Promise<DashboardHfaState> {
  if (!globalThis.crypto?.subtle) {
    throw new Error('WebCrypto is required for HFA setup');
  }

  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  const privateJwk = await crypto.subtle.exportKey(
    'jwk',
    keyPair.privateKey
  ) as JsonWebKeyWithPrivate;

  return {
    version: 1,
    enabled: false,
    hfaUrl: appConfig.hfa.url,
    agentPublicKey: compressedPublicKeyFromJwk(privateJwk),
    agentPrivateJwk: privateJwk,
    agentPrivateKeyHex: privateKeyHexFromJwk(privateJwk),
  };
}

async function createDashboardRequesterState(): Promise<DashboardHfaState> {
  return setStoredState(await generateDashboardRequesterState());
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof json.error === 'string' ? json.error : `HTTP ${response.status}`);
  }
  return json as T;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof json.error === 'string' ? json.error : `HTTP ${response.status}`);
  }
  return json as T;
}

export async function startDashboardHfaSetup(options: {
  connectedWalletAddress: string;
  regenerateKeys?: boolean;
}): Promise<DashboardHfaState> {
  if (!appConfig.hfa.enabled) {
    throw new Error('Dashboard HFA is not enabled');
  }
  if (!options.connectedWalletAddress) {
    throw new Error('Connect Superfluid Wallet before enabling HFA');
  }

  syncDashboardHfaWithWallet(options.connectedWalletAddress);

  const existing = getStoredState();
  const walletChanged = Boolean(
    existing?.walletAddress &&
    !addressesEqual(existing.walletAddress, options.connectedWalletAddress)
  );
  const shouldRegenerate = Boolean(
    options.regenerateKeys ||
    walletChanged ||
    !existing ||
    existing.hfaUrl !== appConfig.hfa.url
  );

  const state = shouldRegenerate
    ? await createDashboardRequesterState()
    : existing!;

  if (!shouldRegenerate) {
    assertConsistentAgentKeys(state);
  }

  const setup = await postJson<HfaSetupSession>(
    `${getApiBase()}/turnkey/hfa/setup-sessions`,
    {
      agentPublicKey: state.agentPublicKey,
      agentLabel: HFA_AGENT_LABEL,
    }
  );

  return setStoredState({
    ...state,
    enabled: false,
    setupSessionId: setup.setupSessionId,
    setupUrl: setup.setupUrl,
    walletAddress: options.connectedWalletAddress,
  });
}

export async function refreshDashboardHfaSetupStatus(
  connectedWalletAddress: string
): Promise<DashboardHfaState> {
  if (!connectedWalletAddress) {
    throw new Error('Connect Superfluid Wallet before checking HFA setup');
  }

  syncDashboardHfaWithWallet(connectedWalletAddress);

  const state = getStoredState();
  if (!state?.setupSessionId) {
    throw new Error('No HFA setup session found');
  }

  assertConsistentAgentKeys(state);

  const setup = await getJson<HfaSetupSession>(
    `${getApiBase()}/turnkey/hfa/setup-sessions/${encodeURIComponent(state.setupSessionId)}`
  );
  if (setup.status !== 'completed') {
    return setStoredState({ ...state, enabled: false });
  }

  if (!setup.walletAddress) {
    throw new Error('HFA setup completed without a wallet address');
  }
  if (!addressesEqual(setup.walletAddress, connectedWalletAddress)) {
    throw new Error(
      'HFA setup was completed for a different wallet. Enable HFA again for the connected wallet.'
    );
  }
  if (setup.agentPublicKey && setup.agentPublicKey !== state.agentPublicKey) {
    throw new Error(
      'HFA setup does not match this browser agent key. Reset HFA keys and complete setup again.'
    );
  }

  return setStoredState({
    ...state,
    enabled: true,
    walletAddress: setup.walletAddress,
  });
}

function normalizeHex(value: string | undefined, fallback: string): Hex {
  return (value && value.startsWith('0x') ? value : fallback) as Hex;
}

export function preparedTransactionToHfaIntent(tx: RpcTransaction): HfaIntent {
  const chainIdHex = normalizeHex(tx.chainId, '0x0');
  const chainId = Number(BigInt(chainIdHex));
  if (!Number.isInteger(chainId) || chainId < 1) {
    throw new Error('HFA transaction is missing a valid chainId');
  }
  if (!tx.to) {
    throw new Error('HFA requires a contract-call transaction with a target address');
  }

  return {
    actions: [{
      chainId,
      to: tx.to,
      data: normalizeHex(tx.data, '0x'),
      value: BigInt(normalizeHex(tx.value, '0x0')).toString(),
    }],
  };
}

function buildSignTransactionBody(options: {
  organizationId: string;
  signWith: string;
  unsignedTransaction: string;
}): string {
  return JSON.stringify({
    type: TURNKEY_SIGN_TRANSACTION_TYPE,
    timestampMs: String(Date.now()),
    organizationId: options.organizationId,
    parameters: {
      signWith: options.signWith,
      unsignedTransaction: options.unsignedTransaction,
      type: TURNKEY_ETHEREUM_TRANSACTION_TYPE,
    },
  });
}

async function buildXStamp(body: string, state: DashboardHfaState): Promise<string> {
  assertConsistentAgentKeys(state);
  const stamper = new ApiKeyStamper({
    apiPublicKey: state.agentPublicKey,
    apiPrivateKey: state.agentPrivateKeyHex ?? privateKeyHexFromJwk(state.agentPrivateJwk),
  });
  return (await stamper.stamp(body)).stampHeaderValue;
}

function formatTurnkeyError(json: unknown): string {
  if (typeof json !== 'object' || json === null) return 'Turnkey signing request failed';
  const record = json as Record<string, unknown>;
  if (typeof record.message === 'string' && record.message.trim()) return record.message;
  if (typeof record.error === 'string' && record.error.trim()) return record.error;
  if (typeof record.turnkeyErrorCode === 'string' && record.turnkeyErrorCode.trim()) {
    return `Turnkey signing request failed (${record.turnkeyErrorCode})`;
  }
  return 'Turnkey signing request failed';
}

function unwrapTurnkeyActivity(response: unknown): Record<string, unknown> {
  const root = response as Record<string, unknown>;
  const paths = [
    ['activity', 'result', 'activity'],
    ['result', 'activity'],
    ['activity'],
  ];

  for (const path of paths) {
    let node: unknown = root;
    for (const key of path) {
      node = typeof node === 'object' && node !== null
        ? (node as Record<string, unknown>)[key]
        : undefined;
    }
    if (typeof node === 'object' && node !== null) return node as Record<string, unknown>;
  }

  return root;
}

async function submitTurnkeySignTransaction(options: {
  state: DashboardHfaState;
  draft: HfaDraftResponse;
}): Promise<{ activityId: string; fingerprint: string }> {
  const body = buildSignTransactionBody({
    organizationId: options.draft.subOrganizationId,
    signWith: options.draft.turnkeyTransaction.signWith,
    unsignedTransaction: options.draft.turnkeyTransaction.unsignedTransaction,
  });
  const xStamp = await buildXStamp(body, options.state);
  const response = await fetch(
    `${appConfig.hfa.turnkeyApiBaseUrl.replace(/\/$/, '')}${TURNKEY_SIGN_TRANSACTION_PATH}`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-stamp': xStamp,
      },
      body,
    }
  );
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(formatTurnkeyError(json));
  }

  const activity = unwrapTurnkeyActivity(json);
  if (
    activity.status !== TURNKEY_CONSENSUS_NEEDED_STATUS ||
    typeof activity.id !== 'string' ||
    typeof activity.fingerprint !== 'string'
  ) {
    const status = typeof activity.status === 'string' ? activity.status : 'unknown';
    throw new Error(
      `Expected Turnkey CONSENSUS_NEEDED activity for HFA (got ${status})`
    );
  }

  return {
    activityId: activity.id,
    fingerprint: activity.fingerprint,
  };
}

function actionRejectedError(message: string): Error {
  const error = new Error(message) as Error & { code?: string };
  error.code = 'ACTION_REJECTED';
  return error;
}

async function pollHfaRequest(requestId: string): Promise<Hex> {
  const deadline = Date.now() + appConfig.hfa.pollTimeoutMs;
  let last: HfaRequestResponse | null = null;

  while (Date.now() < deadline) {
    const request = await getJson<HfaRequestResponse>(
      `${getApiBase()}/turnkey/requests/${encodeURIComponent(requestId)}`
    );
    last = request;

    if (request.status === 'executed') {
      if (!request.txHash) throw new Error('HFA executed without returning a transaction hash');
      return request.txHash as Hex;
    }
    if (request.status === 'rejected_by_human') {
      throw actionRejectedError('HFA request rejected');
    }
    if (
      request.status === 'approval_failed' ||
      request.status === 'signing_failed' ||
      request.status === 'broadcast_failed'
    ) {
      throw new Error(request.error ?? `HFA request failed with status ${request.status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, appConfig.hfa.pollIntervalMs));
  }

  throw new Error(`Timed out waiting for HFA approval${last ? ` (${last.status})` : ''}`);
}

export async function submitTransactionThroughHfa(
  params: unknown,
  options: {
    chainIdHex: `0x${string}` | undefined;
    getRpcUrlForChain: (chainId: number) => string;
    connectedWalletAddress?: string;
  }
): Promise<Hex> {
  const connectedAddress = options.connectedWalletAddress;
  const state = getStoredState();
  if (!appConfig.hfa.enabled || !state?.enabled) {
    throw new Error('HFA is not enabled for this dashboard wallet');
  }
  syncDashboardHfaWithWallet(connectedAddress);
  if (!connectedAddress || !isDashboardHfaReady(connectedAddress)) {
    throw new Error('HFA is not enabled for the connected Superfluid Wallet');
  }
  assertConsistentAgentKeys(state);

  const [preparedTx] = await resolvePopupParams(
    'eth_signTransaction',
    params,
    options.chainIdHex,
    options.getRpcUrlForChain
  ) as [RpcTransaction];
  if (
    !preparedTx.from ||
    !state.walletAddress ||
    preparedTx.from.toLowerCase() !== state.walletAddress.toLowerCase()
  ) {
    throw new Error('HFA setup does not match the transaction sender');
  }
  const intent = preparedTransactionToHfaIntent(preparedTx);
  const draft = await postJson<HfaDraftResponse>(`${getApiBase()}/turnkey/drafts`, {
    agent: HFA_AGENT_LABEL,
    agentPublicKey: state.agentPublicKey,
    intent,
  });

  const activity = await submitTurnkeySignTransaction({ state, draft });
  const request = await postJson<HfaRequestResponse>(`${getApiBase()}/turnkey/requests`, {
    draftId: draft.draftId,
    activityId: activity.activityId,
    fingerprint: activity.fingerprint,
  });

  return pollHfaRequest(request.requestId);
}
