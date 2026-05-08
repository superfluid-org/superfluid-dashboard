/**
 * Types aligned with clearmacro-provider public API
 * (specs/simplified-dapp-facing-relay-api.md).
 */

export type ClearMacroChainCapability = {
  chainId: number;
  forwarderAddress: `0x${string}`;
};

export type ClearMacroCapabilities = {
  providerName: string;
  chains: ClearMacroChainCapability[];
};

export type RelayExecutionState =
  | "pending"
  | "submitted"
  | "succeeded"
  | "reverted"
  | "rejected"
  | "failed"
  | "expired"
  | "canceled";

export type CreateRelayExecutionRequest = {
  kind: "clearMacroV1";
  chainId: number;
  macroAddress: `0x${string}`;
  signerAddress: `0x${string}`;
  payload: `0x${string}`;
  signature: `0x${string}`;
  value?: string;
  forceExecuteAfterPreflightRevert?: boolean;
  clientRequestId?: string;
  metadata?: Record<string, string>;
};

export type RelayExecution = {
  id: string;
  state: RelayExecutionState;
  terminal: boolean;
  kind: "clearMacroV1";
  chainId: number;
  clientRequestId?: string;
  metadata: Record<string, string>;
  forwarderAddress: `0x${string}`;
  macroAddress: `0x${string}`;
  signerAddress: `0x${string}`;
  nonce: string;
  value: string;
  validity: {
    validAfter: string;
    validBefore: string;
  };
  transaction?: {
    hash: `0x${string}`;
    from?: `0x${string}`;
    to: `0x${string}`;
    submittedAt?: string;
  };
  receipt?: {
    transactionHash: `0x${string}`;
    blockNumber: string;
    status: "success" | "reverted";
    gasUsed?: string;
  };
  error?: {
    code: string;
    message: string;
    category: "user" | "provider" | "chain" | "relayer" | "unknown";
    retryable: boolean;
  };
  timestamps: {
    createdAt: string;
    updatedAt: string;
    terminalAt?: string;
  };
  links: {
    self: string;
  };

  /**
   * When fetching with `?include=events`, the provider returns sanitized lifecycle
   * events. The public spec names the query flag but does not pin a stable event DTO;
   * narrow this type once the provider documents or exports a stable schema.
   */
  events?: unknown;
};

export type ClearMacroErrorBody = {
  error: {
    code: string;
    message: string;
    category:
      | "user"
      | "provider"
      | "chain"
      | "relayer"
      | "auth"
      | "validation"
      | "unknown";
    retryable: boolean;
    executionId: string | null;
    details: Record<string, unknown>;
  };
};
