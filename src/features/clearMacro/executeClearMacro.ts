import { Address, Hex, hashTypedData } from "viem";
import {
  Config,
  readContract,
  signTypedData,
  simulateContract,
} from "@wagmi/core";
import {
  clearMacroForwarderAbi,
  clearMacroForwarderAddress,
} from "@sfpro/sdk/abi";
import { RelayPhase } from "../../MutationResult";
import {
  CLEAR_MACRO_LANG,
  ClearMacroAction,
  dashboardClearMacroAbi,
  getActionCallInfo,
  parseEIP712TypeDef,
  resolveActionFieldValue,
} from "./dashboardClearMacro";
import {
  createRelayExecution,
  getCapabilities,
  getFinalTransactionHash,
  pollRelayExecutionUntilTerminal,
} from "./relayApi";

/**
 * Pre-signature miss: the macro path is not configured/available for this call, and the
 * caller silently falls back to the normal write path. NEVER thrown after the user signed.
 */
export class ClearMacroNotEligibleError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ClearMacroNotEligibleError";
  }
}

/** The payload's signature validity window, from signing time. */
const VALIDITY_WINDOW_IN_SECONDS = 600;

export interface ExecuteClearMacroParams {
  chainId: number;
  signerAddress: Address;
  action: ClearMacroAction;
  macroAddress: Address;
  /**
   * The already-resolved fallback write request, simulated before the signature prompt to
   * surface reverts (insufficient balance, existing stream, ...) in the dialog. `runMacro`
   * itself cannot be usefully simulated pre-signature — its signature check precedes the
   * batch operations.
   */
  fallbackSimulationRequest?: Parameters<typeof simulateContract>[1];
  onPhase?: (phase: RelayPhase) => void;
}

/**
 * Executes one Dashboard write through the Clear Macro relay: on-chain payload assembly →
 * EIP-712 `signTypedData` (the wallet renders the macro's human-readable description) →
 * relay POST → poll to terminal. Returns the FINAL hash — receipt hash when present, else
 * the terminal transaction hash (pre-terminal hashes are documented as replaceable and the
 * hash-keyed tracker has no update mechanism; at terminal the hash is final either way).
 *
 * Error contract: `ClearMacroNotEligibleError` = safe to fall back (nothing signed);
 * anything else (simulation revert, signature rejection, relay failure) must surface.
 */
export async function executeClearMacro(
  wagmiConfig: Config,
  params: ExecuteClearMacroParams
): Promise<{ hash: Hex; executionId: string }> {
  const { chainId, signerAddress, action, macroAddress } = params;
  params.onPhase?.("preparing");

  // -- Eligibility ---------------------------------------------------------------------
  const forwarderAddress =
    clearMacroForwarderAddress[chainId as keyof typeof clearMacroForwarderAddress];
  if (!forwarderAddress) {
    throw new ClearMacroNotEligibleError(
      `No ClearMacroForwarder deployment for chain ${chainId}.`
    );
  }

  const capabilities = await getCapabilities().catch((error) => {
    throw new ClearMacroNotEligibleError(
      "Relay provider capabilities unavailable.",
      { cause: error }
    );
  });
  if (!capabilities.chains.some((chain) => chain.chainId === chainId)) {
    throw new ClearMacroNotEligibleError(
      `Relay provider does not serve chain ${chainId}.`
    );
  }

  // -- Payload assembly (on-chain reads; failures here are still safe to fall back) -----
  const callInfo = getActionCallInfo(action);
  let typedData: {
    domain: {
      name: string;
      version: string;
      chainId: number;
      verifyingContract: Address;
    };
    types: Record<string, { type: string; name: string }[]>;
    primaryType: string;
    message: Record<string, unknown>;
  };
  let encodedPayload: Hex;
  try {
    const nonce = (await readContract(wagmiConfig, {
      chainId,
      abi: clearMacroForwarderAbi,
      address: forwarderAddress,
      functionName: "getNonce",
      args: [signerAddress, 0n],
    })) as bigint;

    const actionParams = (await readContract(wagmiConfig, {
      chainId,
      abi: dashboardClearMacroAbi,
      address: macroAddress,
      functionName: callInfo.encodeFunctionName,
      args: [CLEAR_MACRO_LANG, callInfo.tuple],
    } as Parameters<typeof readContract>[1])) as Hex;

    const security = {
      domain: capabilities.providerName,
      macroContract: macroAddress,
      provider: capabilities.providerName,
      validAfter: 0n,
      validBefore: BigInt(
        Math.floor(Date.now() / 1000) + VALIDITY_WINDOW_IN_SECONDS
      ),
      nonce,
    };

    encodedPayload = (await readContract(wagmiConfig, {
      chainId,
      abi: clearMacroForwarderAbi,
      address: forwarderAddress,
      functionName: "encodeParams",
      args: [actionParams, security],
    } as Parameters<typeof readContract>[1])) as Hex;

    const [typeDefinition, primaryType, description, eip712Domain] =
      await Promise.all([
        readContract(wagmiConfig, {
          chainId,
          abi: clearMacroForwarderAbi,
          address: forwarderAddress,
          functionName: "getTypeDefinition",
          args: [macroAddress, encodedPayload],
        } as Parameters<typeof readContract>[1]) as Promise<string>,
        readContract(wagmiConfig, {
          chainId,
          abi: dashboardClearMacroAbi,
          address: macroAddress,
          functionName: "getPrimaryTypeName",
          args: [encodedPayload],
        }) as Promise<string>,
        readContract(wagmiConfig, {
          chainId,
          abi: dashboardClearMacroAbi,
          address: macroAddress,
          functionName: callInfo.describeFunctionName,
          args: [CLEAR_MACRO_LANG, callInfo.tuple],
        } as Parameters<typeof readContract>[1]) as Promise<string>,
        readContract(wagmiConfig, {
          chainId,
          abi: clearMacroForwarderAbi,
          address: forwarderAddress,
          functionName: "eip712Domain",
        }) as Promise<
          readonly [Hex, string, string, bigint, Address, Hex, readonly bigint[]]
        >,
      ]);

    // The Action message fields come from the runtime type definition — populated by
    // PARSED name, never assumed, so a divergence degrades to fallback instead of an
    // on-chain InvalidSignature (see the design doc's "EIP-712 assembly" gotchas).
    const types = parseEIP712TypeDef(typeDefinition);
    const primaryTypeFields = types[primaryType];
    if (!primaryTypeFields) {
      throw new ClearMacroNotEligibleError(
        `EIP-712 primary type "${primaryType}" missing from the type definition.`
      );
    }
    const actionField = primaryTypeFields.find((f) => f.name === "action");
    const securityField = primaryTypeFields.find((f) => f.name === "security");
    const actionTypeFields = actionField ? types[actionField.type] : undefined;
    const securityTypeFields = securityField
      ? types[securityField.type]
      : undefined;
    if (!actionField || !securityField || !actionTypeFields || !securityTypeFields) {
      throw new ClearMacroNotEligibleError(
        "Unexpected EIP-712 primary type shape (expected action + security fields)."
      );
    }

    const actionMessage: Record<string, unknown> = {};
    for (const field of actionTypeFields) {
      const value = resolveActionFieldValue(action, description, field.name);
      if (value === undefined) {
        throw new ClearMacroNotEligibleError(
          `No value for EIP-712 Action field "${field.name}".`
        );
      }
      actionMessage[field.name] = value;
    }

    // The Security fields get the same parsed-name treatment as the Action fields:
    // a divergence from the expected struct degrades to fallback, never to a digest
    // that the forwarder rejects with InvalidSignature.
    const securityMessage: Record<string, unknown> = {};
    for (const field of securityTypeFields) {
      const value = (security as Record<string, unknown>)[field.name];
      if (value === undefined) {
        throw new ClearMacroNotEligibleError(
          `No value for EIP-712 Security field "${field.name}".`
        );
      }
      securityMessage[field.name] = value;
    }

    const [, domainName, domainVersion, domainChainId, verifyingContract] =
      eip712Domain;
    typedData = {
      domain: {
        name: domainName,
        version: domainVersion,
        chainId: Number(domainChainId),
        verifyingContract,
      },
      types,
      primaryType,
      message: { action: actionMessage, security: securityMessage },
    };

    // Definitive pre-signature check: the locally assembled typed data must hash to the
    // exact digest the forwarder will verify. Catches any field-name/type/value drift on
    // new macro deployments deterministically (instead of a post-signature
    // SIGNATURE_INVALID from the relay) and degrades to fallback.
    const digestOnChain = (await readContract(wagmiConfig, {
      chainId,
      abi: clearMacroForwarderAbi,
      address: forwarderAddress,
      functionName: "getDigest",
      args: [macroAddress, encodedPayload],
    })) as Hex;
    const digestLocal = hashTypedData(
      typedData as Parameters<typeof hashTypedData>[0]
    );
    if (digestLocal.toLowerCase() !== digestOnChain.toLowerCase()) {
      throw new ClearMacroNotEligibleError(
        `Locally computed EIP-712 digest (${digestLocal}) does not match the forwarder's getDigest (${digestOnChain}).`
      );
    }
  } catch (error) {
    if (error instanceof ClearMacroNotEligibleError) throw error;
    throw new ClearMacroNotEligibleError(
      "Clear Macro payload assembly failed.",
      { cause: error }
    );
  }

  // -- Pre-signature simulation of the FALLBACK write -----------------------------------
  // A revert here is rethrown as-is (NOT wrapped): it surfaces in the dialog exactly like
  // `simulate: true` does today — falling back would just revert again, with gas.
  if (params.fallbackSimulationRequest) {
    await simulateContract(wagmiConfig, params.fallbackSimulationRequest);
  }

  // -- Signature. From here on, NEVER fall back (no silent second wallet prompt). -------
  params.onPhase?.("awaiting-signature");
  const signature = await signTypedData(wagmiConfig, {
    account: signerAddress,
    domain: typedData.domain,
    types: typedData.types,
    primaryType: typedData.primaryType,
    message: typedData.message,
  } as Parameters<typeof signTypedData>[1]);

  params.onPhase?.("relaying");

  // NOTE: deliberately NO local `runMacro` simulation here — the forwarder authorizes
  // `security.provider` against msg.sender, so simulating from anyone but the relayer's
  // (unknown) address reverts ProviderNotAuthorized (verified on-chain). Signature
  // validity is already proven by the digest pre-check; the relay runs its own preflight.
  const execution = await createRelayExecution({
    kind: "clearMacroV1",
    chainId,
    macroAddress,
    signerAddress,
    payload: encodedPayload,
    signature,
    metadata: { source: "dashboard" },
  });

  const terminalExecution = await pollRelayExecutionUntilTerminal(execution.id);
  // pollRelayExecutionUntilTerminal only resolves on `succeeded` with a final hash present.
  return {
    hash: getFinalTransactionHash(terminalExecution)!,
    executionId: terminalExecution.id,
  };
}
