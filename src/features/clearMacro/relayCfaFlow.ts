import {
  getFramework,
  registerNewTransaction,
  type TransactionTitle,
} from "@superfluid-finance/sdk-redux";
import type { ThunkDispatch } from "@reduxjs/toolkit";
import type { AnyAction } from "redux";
import { BigNumber, Contract, ethers } from "ethers";
import config from "../../utils/config";
import { clearMacroForwarderReadAbi } from "./clearMacroForwarderReadAbi";
import { dashboardClearMacroReadAbi } from "./dashboardClearMacroReadAbi";
import {
  DASHBOARD_CLEAR_MACRO_ACTION_CREATE_FLOW,
  DASHBOARD_CLEAR_MACRO_ACTION_DELETE_FLOW,
  DASHBOARD_CLEAR_MACRO_ACTION_UPDATE_FLOW,
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

const EIP712_DOMAIN = {
  name: "ClearMacro",
  version: "1",
} as const;

const RELAY_VALIDITY_WINDOW_SECONDS = 15 * 60;

/** Solidity `type(int96).min / max`: ±(2¹⁵ − 1)-bit magnitude for the positive half is 2⁹⁵−1 */
const CFA_INT96_MAX = BigNumber.from(
  "39614081257132168796771975167" // 2^95 - 1
);
const CFA_INT96_MIN = BigNumber.from(
  "-39614081257132168796771975168" // -2^95
);

function encodeDashboardCreateFlowMacroParams(args: {
  superToken: string;
  receiver: string;
  flowRateWei: string;
}): string {
  const flowBn = BigNumber.from(args.flowRateWei);
  const inner = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "int96"],
    [args.superToken, args.receiver, flowBn]
  );
  return ethers.utils.defaultAbiCoder.encode(
    ["uint8", "bytes32", "bytes"],
    [DASHBOARD_CLEAR_MACRO_ACTION_CREATE_FLOW, DASHBOARD_CLEAR_MACRO_LANG_EN_BYTES32, inner]
  );
}

function encodeDashboardUpdateFlowMacroParams(args: {
  superToken: string;
  receiver: string;
  flowRateWei: string;
}): string {
  const flowBn = BigNumber.from(args.flowRateWei);
  const inner = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "int96"],
    [args.superToken, args.receiver, flowBn]
  );
  return ethers.utils.defaultAbiCoder.encode(
    ["uint8", "bytes32", "bytes"],
    [DASHBOARD_CLEAR_MACRO_ACTION_UPDATE_FLOW, DASHBOARD_CLEAR_MACRO_LANG_EN_BYTES32, inner]
  );
}

function encodeDashboardDeleteFlowMacroParams(args: {
  superToken: string;
  sender: string;
  receiver: string;
}): string {
  const inner = ethers.utils.defaultAbiCoder.encode(
    ["address", "address", "address"],
    [args.superToken, args.sender, args.receiver]
  );
  return ethers.utils.defaultAbiCoder.encode(
    ["uint8", "bytes32", "bytes"],
    [DASHBOARD_CLEAR_MACRO_ACTION_DELETE_FLOW, DASHBOARD_CLEAR_MACRO_LANG_EN_BYTES32, inner]
  );
}

function fitsSignedInt96FlowRate(flowRateWei: string): boolean {
  try {
    const bn = BigNumber.from(flowRateWei);
    return !bn.gt(CFA_INT96_MAX) && !bn.lt(CFA_INT96_MIN);
  } catch {
    return false;
  }
}

const securityTypesFields = [
  { name: "domain", type: "string" },
  { name: "macroContract", type: "address" },
  { name: "provider", type: "string" },
  { name: "validAfter", type: "uint256" },
  { name: "validBefore", type: "uint256" },
  { name: "nonce", type: "uint256" },
] as const;

export type DashboardCfaRelayKind = "create" | "update" | "delete";

type RelayCfaArgsBase = {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  signer: ethers.Signer;
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>;
  subTransactionTitles: TransactionTitle[];
  transactionTitle: TransactionTitle;
  transactionExtraData?: Record<string, unknown>;
  capabilities: ClearMacroCapabilities | null | undefined;
};

export type TryRelayDashboardCfaArgs =
  | (RelayCfaArgsBase & { kind: "create"; flowRateWei: string })
  | (RelayCfaArgsBase & { kind: "update"; flowRateWei: string })
  | (RelayCfaArgsBase & { kind: "delete" });

/**
 * Relay a single CFA create/update/delete via DashboardClearMacro.
 * Returns `null` to fall back to direct `Operation.exec` (pre-sign failures only).
 * Throws on wallet EIP-712 failure or relay errors after signing.
 */
export async function tryRelayExecuteDashboardCfa(
  relayArgs: TryRelayDashboardCfaArgs
): Promise<{
  data: {
    chainId: number;
    hash: string;
    subTransactionTitles: TransactionTitle[];
  };
} | null> {
  if (!isClearMacroIntegrationEnabled()) {
    return null;
  }
  if (!relayArgs.capabilities) {
    return null;
  }
  const macroAddress = getDashboardClearMacroAddress(relayArgs.chainId);
  const forwarderAddress = getClearMacroForwarderForChain(
    relayArgs.capabilities,
    relayArgs.chainId
  );
  if (!macroAddress || !forwarderAddress) {
    return null;
  }
  if (!isClearMacroChainSupported(relayArgs.capabilities, relayArgs.chainId)) {
    return null;
  }

  if (relayArgs.kind !== "delete" && !fitsSignedInt96FlowRate(relayArgs.flowRateWei)) {
    return null;
  }

  const signerAddress = await relayArgs.signer.getAddress();
  if (signerAddress.toLowerCase() !== relayArgs.senderAddress.toLowerCase()) {
    return null;
  }

  const typedSigner = relayArgs.signer as ethers.Signer & {
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

  const framework = await getFramework(relayArgs.chainId);
  const provider = framework.settings.provider;

  const forwarder = new Contract(
    forwarderAddress,
    clearMacroForwarderReadAbi,
    provider
  );
  const macro = new Contract(macroAddress, dashboardClearMacroReadAbi, provider);

  let actionParams: string;
  let description: string;
  try {
    if (relayArgs.kind === "create") {
      const tuple = [
        relayArgs.superTokenAddress,
        relayArgs.receiverAddress,
        BigNumber.from(relayArgs.flowRateWei),
      ];
      actionParams = encodeDashboardCreateFlowMacroParams({
        superToken: relayArgs.superTokenAddress,
        receiver: relayArgs.receiverAddress,
        flowRateWei: relayArgs.flowRateWei,
      });
      description = await macro.describeCreateFlow(
        DASHBOARD_CLEAR_MACRO_LANG_EN_BYTES32,
        tuple
      );
    } else if (relayArgs.kind === "update") {
      const tuple = [
        relayArgs.superTokenAddress,
        relayArgs.receiverAddress,
        BigNumber.from(relayArgs.flowRateWei),
      ];
      actionParams = encodeDashboardUpdateFlowMacroParams({
        superToken: relayArgs.superTokenAddress,
        receiver: relayArgs.receiverAddress,
        flowRateWei: relayArgs.flowRateWei,
      });
      description = await macro.describeUpdateFlow(
        DASHBOARD_CLEAR_MACRO_LANG_EN_BYTES32,
        tuple
      );
    } else {
      const tuple = [
        relayArgs.superTokenAddress,
        relayArgs.senderAddress,
        relayArgs.receiverAddress,
      ];
      actionParams = encodeDashboardDeleteFlowMacroParams({
        superToken: relayArgs.superTokenAddress,
        sender: relayArgs.senderAddress,
        receiver: relayArgs.receiverAddress,
      });
      description = await macro.describeDeleteFlow(
        DASHBOARD_CLEAR_MACRO_LANG_EN_BYTES32,
        tuple
      );
    }
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
    relayArgs.capabilities.providerName,
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
    chainId: relayArgs.chainId,
    verifyingContract: forwarderAddress,
  };

  const securityForMessage = {
    domain: DASHBOARD_CLEAR_MACRO_REGISTRY_DOMAIN,
    macroContract: macroChecksummed,
    provider: relayArgs.capabilities.providerName,
    validAfter: validAfter.toString(),
    validBefore: validBefore.toString(),
    nonce: nonce.toString(),
  };

  let types: Record<string, { name: string; type: string }[]>;
  let message: Record<string, unknown>;

  if (relayArgs.kind === "create") {
    types = {
      Action: [
        { name: "description", type: "string" },
        { name: "token", type: "address" },
        { name: "receiver", type: "address" },
        { name: "flowRate", type: "int96" },
      ],
      Security: [...securityTypesFields],
      CreateFlow: [
        { name: "action", type: "Action" },
        { name: "security", type: "Security" },
      ],
    };
    message = {
      action: {
        description,
        token: relayArgs.superTokenAddress,
        receiver: relayArgs.receiverAddress,
        flowRate: BigNumber.from(relayArgs.flowRateWei).toString(),
      },
      security: securityForMessage,
    };
  } else if (relayArgs.kind === "update") {
    types = {
      Action: [
        { name: "description", type: "string" },
        { name: "token", type: "address" },
        { name: "receiver", type: "address" },
        { name: "flowRate", type: "int96" },
      ],
      Security: [...securityTypesFields],
      UpdateFlow: [
        { name: "action", type: "Action" },
        { name: "security", type: "Security" },
      ],
    };
    message = {
      action: {
        description,
        token: relayArgs.superTokenAddress,
        receiver: relayArgs.receiverAddress,
        flowRate: BigNumber.from(relayArgs.flowRateWei).toString(),
      },
      security: securityForMessage,
    };
  } else {
    types = {
      Action: [
        { name: "description", type: "string" },
        { name: "token", type: "address" },
        { name: "sender", type: "address" },
        { name: "receiver", type: "address" },
      ],
      Security: [...securityTypesFields],
      DeleteFlow: [
        { name: "action", type: "Action" },
        { name: "security", type: "Security" },
      ],
    };
    message = {
      action: {
        description,
        token: relayArgs.superTokenAddress,
        sender: relayArgs.senderAddress,
        receiver: relayArgs.receiverAddress,
      },
      security: securityForMessage,
    };
  }

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
    throw e;
  }

  const metaSource =
    relayArgs.kind === "create"
      ? "dashboard-cfa-create-flow"
      : relayArgs.kind === "update"
        ? "dashboard-cfa-update-flow"
        : "dashboard-cfa-delete-flow";

  const execution = await postRelayExecution(config.clearMacro.providerBaseUrl, {
    kind: "clearMacroV1",
    chainId: relayArgs.chainId,
    macroAddress: macroChecksummed as `0x${string}`,
    signerAddress: ethers.utils.getAddress(signerAddress) as `0x${string}`,
    payload: payload as `0x${string}`,
    signature: signature as `0x${string}`,
    metadata: { source: metaSource },
  });

  const txHash = await waitForRelayExecutionTransactionHash(
    config.clearMacro.providerBaseUrl,
    execution.id
  );

  const subTitles = relayArgs.subTransactionTitles;
  const extraData = {
    subTransactionTitles: subTitles,
    ...(relayArgs.transactionExtraData ?? {}),
  };

  await registerNewTransaction({
    dispatch: relayArgs.dispatch,
    signerAddress,
    chainId: relayArgs.chainId,
    title: relayArgs.transactionTitle,
    extraData,
    transactionResponse: {
      chainId: relayArgs.chainId,
      hash: txHash,
      wait: () => provider.waitForTransaction(txHash),
    },
  });

  return {
    data: {
      chainId: relayArgs.chainId,
      hash: txHash,
      subTransactionTitles: subTitles,
    },
  };
}
