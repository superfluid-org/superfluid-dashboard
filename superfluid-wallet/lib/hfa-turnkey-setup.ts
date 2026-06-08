import { getAddress, isAddress, type Address } from 'viem';

export type TurnkeyWalletLike = {
  accounts: Array<{ address?: string | null }>;
};

export interface HfaCoApprovalPolicy {
  policyName: string;
  effect: 'EFFECT_ALLOW';
  consensus: string;
  condition: string;
  notes: string;
}

export function buildHfaCoApprovalPolicy(options: {
  walletAddress: Address;
  agentUserId: string;
  providerUserId: string;
}): HfaCoApprovalPolicy {
  const walletAddress = getAddress(options.walletAddress);
  return {
    policyName: `HFA co-approval for ${walletAddress}`,
    effect: 'EFFECT_ALLOW',
    consensus: `approvers.any(user, user.id == '${options.agentUserId}') && approvers.any(user, user.id == '${options.providerUserId}')`,
    condition: `activity.type == 'ACTIVITY_TYPE_SIGN_TRANSACTION_V2' && eth.tx.from == '${walletAddress}'`,
    notes: 'Superfluid Wallet HFA delegated-access co-approval policy',
  };
}

export function resolveFirstEvmWalletAccount(
  wallets: TurnkeyWalletLike[]
): Address {
  for (const wallet of wallets) {
    for (const account of wallet.accounts) {
      if (account.address && account.address.startsWith('0x') && isAddress(account.address)) {
        return account.address as Address;
      }
    }
  }
  throw new Error('No EVM wallet account found in Turnkey session');
}

export interface HfaTurnkeySetupResult {
  subOrganizationId: string;
  walletAddress: Address;
  agentUserId: string;
  providerUserId: string;
  policyIds: string[];
}

type TurnkeyUserLike = {
  userId?: string;
  id?: string;
};

type FetchOrCreateP256ApiKeyUser = (params: {
  publicKey: string;
  organizationId?: string;
  createParams?: {
    apiKeyName?: string;
    userName?: string;
  };
}) => Promise<TurnkeyUserLike>;

type FetchOrCreatePolicies = (params: {
  organizationId?: string;
  policies: Array<HfaCoApprovalPolicy & { notes: string }>;
}) => Promise<Array<{ policyId: string } & HfaCoApprovalPolicy>>;

function readTurnkeyUserId(user: TurnkeyUserLike): string {
  const userId = user.userId ?? user.id;
  if (!userId) {
    throw new Error('Turnkey user response missing userId');
  }
  return userId;
}

export async function runHfaTurnkeySetup(options: {
  organizationId: string;
  wallets: TurnkeyWalletLike[];
  agentPublicKey: string;
  providerPublicKey: string;
  fetchOrCreateP256ApiKeyUser: FetchOrCreateP256ApiKeyUser;
  fetchOrCreatePolicies: FetchOrCreatePolicies;
}): Promise<HfaTurnkeySetupResult> {
  const walletAddress = resolveFirstEvmWalletAccount(options.wallets);

  const agentUser = await options.fetchOrCreateP256ApiKeyUser({
    publicKey: options.agentPublicKey,
    organizationId: options.organizationId,
    createParams: {
      userName: 'HFA Agent',
      apiKeyName: `hfa-agent-${options.agentPublicKey.slice(0, 8)}`,
    },
  });

  const providerUser = await options.fetchOrCreateP256ApiKeyUser({
    publicKey: options.providerPublicKey,
    organizationId: options.organizationId,
    createParams: {
      userName: 'Superfluid HFA Provider',
      apiKeyName: `hfa-provider-${options.providerPublicKey.slice(0, 8)}`,
    },
  });

  const agentUserId = readTurnkeyUserId(agentUser);
  const providerUserId = readTurnkeyUserId(providerUser);
  const policy = buildHfaCoApprovalPolicy({
    walletAddress,
    agentUserId,
    providerUserId,
  });

  const policies = await options.fetchOrCreatePolicies({
    organizationId: options.organizationId,
    policies: [policy],
  });

  const policyIds = policies
    .map((entry) => entry.policyId)
    .filter((policyId): policyId is string => typeof policyId === 'string' && policyId.length > 0);

  if (policyIds.length === 0) {
    throw new Error('Turnkey did not return any policy IDs');
  }

  return {
    subOrganizationId: options.organizationId,
    walletAddress,
    agentUserId,
    providerUserId,
    policyIds,
  };
}

export function buildHfaSetupCompletePayload(options: {
  setupResult: HfaTurnkeySetupResult;
  agentPublicKey: string;
  walletOrigin: string;
}) {
  return {
    subOrganizationId: options.setupResult.subOrganizationId,
    walletAddress: getAddress(options.setupResult.walletAddress),
    agentPublicKey: options.agentPublicKey,
    agentUserId: options.setupResult.agentUserId,
    providerUserId: options.setupResult.providerUserId,
    policyIds: options.setupResult.policyIds,
    walletOrigin: options.walletOrigin,
  };
}
