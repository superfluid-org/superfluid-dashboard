import {
  getFramework,
  registerNewTransactionAndReturnQueryFnResult,
  type TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import type { ThunkDispatch } from "@reduxjs/toolkit";
import type { AnyAction } from "redux";
import { BigNumber, Contract, ethers } from "ethers";
import config from "../../utils/config";
import { clearMacroForwarderReadAbi } from "./clearMacroForwarderReadAbi";
import { dashboardClearMacroReadAbi } from "./dashboardClearMacroReadAbi";
import {
  DASHBOARD_CLEAR_MACRO_ACTION_TRANSFER,
  DASHBOARD_CLEAR_MACRO_LANG_EN_BYTES32,
  DASHBOARD_CLEAR_MACRO_REGISTRY_DOMAIN,
} from "./dashboardClearMacroConstants";
import { getDashboardClearMacroAddress } from "./dashboardClearMacroAddresses";
import {
  getClearMacroForwarderForChain,
  isClearMacroChainSupported,
} from "./capabilities";
import type { ClearMacroCapabilities } from "./types";
import { isClearMacroIntegrationEnabled } from "./clearMacroIntegration";
import {
  postRelayExecution,
  waitForRelayExecutionTransactionHash,
} from "./relayExecutionClient";

/**
 * When relay is not used or fails before signing, the caller should submit the
 * direct wallet transaction. Once wallet signing starts, all signing/relay
 * failures remain user-visible so we never risk an unintended direct transfer.
 */
function isUserSignatureRejection(e: unknown): boolean {
  const err = e as { code?: number | string; message?: string };
  if (err?.code === "ACTION_REJECTED" || err?.code === 4001) {
    return true;
  }
  const m = (err?.message ?? "").toLowerCase();
  return (
    m.includes("user denied") ||
    m.includes("user rejected") ||
    m.includes("rejected the request")
  );
}

/**
 * After a successful relay EIP-712 signature, HTTP/polling failures throw. Offer a
 * deliberate wallet `transfer` retry — never for user rejection of signing.
 */
export function shouldOfferWalletRetryAfterClearMacroError(e: unknown): boolean {
  if (isUserSignatureRejection(e)) {
    return false;
  }
  const msg =
    e &&
    typeof e === "object" &&
    "message" in e &&
    typeof (e as { message: unknown }).message === "string"
      ? (e as { message: string }).message
      : e instanceof Error
        ? e.message
        : String(e);
  return /clearmacro/i.test(msg);
}

function encodeDashboardTransferMacroParams(args: {
  superToken: string;
  receiver: string;
  amountWei: string;
}): string {
  const inner = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "uint256"],
    [args.superToken, args.receiver, BigNumber.from(args.amountWei)]
  );
  return ethers.utils.defaultAbiCoder.encode(
    ["uint8", "bytes32", "bytes"],
    [DASHBOARD_CLEAR_MACRO_ACTION_TRANSFER, DASHBOARD_CLEAR_MACRO_LANG_EN_BYTES32, inner]
  );
}

const EIP712_DOMAIN = {
  name: "ClearMacro",
  version: "1",
} as const;

const RELAY_VALIDITY_WINDOW_SECONDS = 15 * 60;

type RelayTransferArgs = {
  chainId: number;
  /** Super token (same as direct ERC20 transfer `to`). */
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  amountWei: string;
  signer: ethers.Signer;
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>;
  transactionTitle: TransactionTitle;
  transactionExtraData?: Record<string, unknown>;
  capabilities: ClearMacroCapabilities | null | undefined;
};

/**
 * Returns a registered transaction result when ClearMacro relay is used successfully.
 * Returns null to fall back to a direct wallet transaction (pre-sign only).
 */
export async function tryRelayExecuteSuperTokenTransfer({
  chainId,
  superTokenAddress,
  senderAddress,
  receiverAddress,
  amountWei,
  signer,
  dispatch,
  transactionTitle,
  transactionExtraData,
  capabilities,
}: RelayTransferArgs): Promise<
  Awaited<ReturnType<typeof registerNewTransactionAndReturnQueryFnResult>> | null
> {
  if (!isClearMacroIntegrationEnabled()) {
    return null;
  }
  if (!capabilities) {
    return null;
  }
  const macroAddress = getDashboardClearMacroAddress(chainId);
  const forwarderAddress = getClearMacroForwarderForChain(capabilities, chainId);
  if (!macroAddress || !forwarderAddress) {
    return null;
  }
  if (!isClearMacroChainSupported(capabilities, chainId)) {
    return null;
  }

  const signerAddress = await signer.getAddress();
  if (signerAddress.toLowerCase() !== senderAddress.toLowerCase()) {
    return null;
  }

  /** JsonRpcSigner exposes EIP-712 in ethers v5; not on the abstract Signer type. */
  const typedSigner = signer as ethers.Signer & {
    _signTypedData?: (
      domain: {
        name: string;
        version: string;
        chainId: number;
        verifyingContract: string;
      },
      types: Record<string, { name: string; type: string }[]>,
      value: Record<string, unknown>
    ) => Promise<string>;
  };
  if (typeof typedSigner._signTypedData !== "function") {
    return null;
  }

  const framework = await getFramework(chainId);
  const provider = framework.settings.provider;

  const forwarder = new Contract(
    forwarderAddress,
    clearMacroForwarderReadAbi,
    provider
  );
  const macro = new Contract(macroAddress, dashboardClearMacroReadAbi, provider);

  const actionParams = encodeDashboardTransferMacroParams({
    superToken: superTokenAddress,
    receiver: receiverAddress,
    amountWei,
  });

  let description: string;
  try {
    description = await macro.describeTransfer(
      DASHBOARD_CLEAR_MACRO_LANG_EN_BYTES32,
      [superTokenAddress, receiverAddress, BigNumber.from(amountWei)]
    );
  } catch {
    return null;
  }

  let nonce: BigNumber;
  try {
    nonce = await forwarder.getNonce(signerAddress, 0);
  } catch {
    return null;
  }

  const macroChecksummed = ethers.utils.getAddress(macroAddress);

  const validAfter = BigNumber.from(0);
  const validBefore = BigNumber.from(
    Math.floor(Date.now() / 1000) + RELAY_VALIDITY_WINDOW_SECONDS
  );

  const securityTuple = [
    DASHBOARD_CLEAR_MACRO_REGISTRY_DOMAIN,
    macroChecksummed,
    capabilities.providerName,
    validAfter,
    validBefore,
    nonce,
  ] as const;

  let payload: string;
  try {
    payload = await forwarder.encodeParams(actionParams, securityTuple);
  } catch {
    return null;
  }

  const domain = {
    ...EIP712_DOMAIN,
    chainId,
    verifyingContract: forwarderAddress,
  };

  const types = {
    Action: [
      { name: "description", type: "string" },
      { name: "token", type: "address" },
      { name: "receiver", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    Security: [
      { name: "domain", type: "string" },
      { name: "macroContract", type: "address" },
      { name: "provider", type: "string" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
    DashboardTransfer: [
      { name: "action", type: "Action" },
      { name: "security", type: "Security" },
    ],
  };

  const message = {
    action: {
      description,
      token: superTokenAddress,
      receiver: receiverAddress,
      amount: BigNumber.from(amountWei).toString(),
    },
    security: {
      domain: DASHBOARD_CLEAR_MACRO_REGISTRY_DOMAIN,
      macroContract: macroChecksummed,
      provider: capabilities.providerName,
      validAfter: validAfter.toString(),
      validBefore: validBefore.toString(),
      nonce: nonce.toString(),
    },
  };

  let digestOnChain: string;
  try {
    digestOnChain = await forwarder.getDigest(macroChecksummed, payload);
  } catch {
    return null;
  }

  let digestLocal: string;
  try {
    digestLocal = ethers.utils._TypedDataEncoder.hash(domain, types, message);
  } catch {
    return null;
  }

  if (digestOnChain.toLowerCase() !== digestLocal.toLowerCase()) {
    return null;
  }

  let signature: string;
  try {
    signature = await typedSigner._signTypedData(domain, types, message);
  } catch (e) {
    // Once the wallet signing flow has started, never silently submit the
    // direct transfer path. Some wallets report rejection with non-standard
    // error shapes, so all signing failures stay user-visible.
    throw e;
  }

  const execution = await postRelayExecution(config.clearMacro.providerBaseUrl, {
    kind: "clearMacroV1",
    chainId,
    macroAddress: macroChecksummed as `0x${string}`,
    signerAddress: ethers.utils.getAddress(signerAddress) as `0x${string}`,
    payload: payload as `0x${string}`,
    signature: signature as `0x${string}`,
    metadata: { source: "dashboard-send-transfer" },
  });

  const txHash = await waitForRelayExecutionTransactionHash(
    config.clearMacro.providerBaseUrl,
    execution.id
  );

  return await registerNewTransactionAndReturnQueryFnResult({
    dispatch,
    signerAddress,
    chainId,
    title: transactionTitle,
    extraData: transactionExtraData,
    transactionResponse: {
      chainId,
      hash: txHash,
      wait: () => provider.waitForTransaction(txHash),
    },
  });
}

