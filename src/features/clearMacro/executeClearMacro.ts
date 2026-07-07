import {
  Address,
  BaseError,
  ContractFunctionZeroDataError,
  erc20Abi,
  formatEther,
  formatUnits,
  Hex,
  hashStruct,
  hashTypedData,
} from "viem";
import {
  Config,
  readContract,
  signTypedData,
  simulateContract,
} from "@wagmi/core";
import {
  clearMacroForwarderAbi,
  clearMacroForwarderAddress,
  superTokenAbi,
} from "@sfpro/sdk/abi";
import { RelayPhase } from "../../MutationResult";
import { findTokenFromTokenList } from "../../hooks/useTokenQuery";
import { TokenType } from "../redux/endpoints/tokenTypes";
import {
  CLEAR_MACRO_LANG,
  ClearMacroAction,
  dashboardClearMacroAbi,
  getActionCallInfo,
  parseEIP712TypeDef,
  resolveActionFieldValue,
} from "./dashboardClearMacro";
import {
  buildPermit2Types,
  feeToUnderlyingUnitsCeil,
  generatePermit2Nonce,
  PERMIT2_ADDRESS,
} from "./permit2";
import {
  chainSupportsPermit2,
  createRelayExecution,
  getCapabilities,
  getFinalTransactionHash,
  pollRelayExecutionUntilTerminal,
  type RelayExecution,
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

/**
 * The signer can't cover the macro's relay fee for this payment mode. Thrown BEFORE the
 * signature and — unlike `ClearMacroNotEligibleError` — deliberately NOT a silent self-pay
 * fallback: a known fee shortfall is surfaced to the user (who can switch payment mode in
 * the relay chip — it offers pay-with-USDC on a USDCx shortfall). In `usdc-permit2` mode the
 * numbers are denominated in the UNDERLYING token (USDC). Carries the numbers so the UI can
 * format a message.
 */
export class ClearMacroInsufficientFeeError extends Error {
  constructor(
    message: string,
    public readonly details: {
      feeToken: Address;
      requiredFee: bigint;
      availableBalance: bigint;
    }
  ) {
    super(message);
    this.name = "ClearMacroInsufficientFeeError";
  }
}

/**
 * The signer's USDC allowance to Permit2 doesn't cover the relay fee for the `usdc-permit2`
 * payment mode. Thrown BEFORE the signature and surfaced (never a silent fallback): the chip
 * approves proactively, so this is belt-and-suspenders for an allowance race. Carries the
 * approval target so the UI can point at the one-time approve.
 */
export class ClearMacroPermit2ApprovalRequiredError extends Error {
  constructor(
    message: string,
    public readonly details: {
      token: Address;
      spender: Address;
      required: bigint;
    }
  ) {
    super(message);
    this.name = "ClearMacroPermit2ApprovalRequiredError";
  }
}

/**
 * How the macro's USDCx fee is funded. `usdcx-direct` (default) charges an existing USDCx
 * balance via plain `runMacro`. `usdc-permit2` wraps USDC just-in-time via the forwarder's
 * Permit2 path — one `PermitWitnessTransferFrom` signature replaces the ClearMacro signature.
 */
export type ClearMacroPaymentMode = "usdcx-direct" | "usdc-permit2";

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
  /** Fee funding mode; defaults to `usdcx-direct`. */
  paymentMode?: ClearMacroPaymentMode;
  onPhase?: (phase: RelayPhase) => void;
  /**
   * Called once, immediately after the relay accepts the signed payload and BEFORE polling —
   * with the provider's `executionId` and echoed `validBefore` (unix seconds). The caller uses
   * this to durably persist the execution so a poll timeout / closed tab / reload can still
   * recover it. Awaited so the caller can flush the persisted write before the poll begins.
   */
  onExecutionCreated?: (info: {
    executionId: string;
    validBefore: number;
  }) => void | Promise<void>;
}

/** The `security` struct signed into every ClearMacro payload (both payment modes). */
interface ClearMacroSecurity {
  domain: string;
  macroContract: Address;
  provider: string;
  validAfter: bigint;
  validBefore: bigint;
  nonce: bigint;
}

/**
 * Populates the EIP-712 `Action`/`Security` messages field-by-PARSED-name (from the
 * on-chain type definition at runtime — never assumed), shared by both payment modes:
 * usdcx-direct signs them under the ClearMacro digest, usdc-permit2 inside the Permit2
 * witness. A field we don't know a value for aborts to the fallback path — guessing would
 * produce an `InvalidSignature` revert on-chain.
 */
function buildActionSecurityMessages(
  actionTypeFields: { type: string; name: string }[],
  securityTypeFields: { type: string; name: string }[],
  action: ClearMacroAction,
  description: string,
  security: ClearMacroSecurity
): {
  actionMessage: Record<string, unknown>;
  securityMessage: Record<string, unknown>;
} {
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

  const securityMessage: Record<string, unknown> = {};
  for (const field of securityTypeFields) {
    const value = (security as unknown as Record<string, unknown>)[field.name];
    if (value === undefined) {
      throw new ClearMacroNotEligibleError(
        `No value for EIP-712 Security field "${field.name}".`
      );
    }
    securityMessage[field.name] = value;
  }

  return { actionMessage, securityMessage };
}

/**
 * Reads `previewRelayFee`, distinguishing "the deployed macro predates fees" — the call
 * returns zero data because the function doesn't exist, so there is nothing to guard and
 * the caller proceeds feeless (`undefined`) — from every other failure (RPC blip, real
 * revert), which throws `ClearMacroNotEligibleError` so the caller degrades to self-pay
 * instead of silently skipping the fee guard and signing into a possible relay revert.
 */
async function readRelayFeeQuote(
  wagmiConfig: Config,
  args: {
    chainId: number;
    macroAddress: Address;
    actionParams: Hex;
    signerAddress: Address;
  }
): Promise<
  readonly [feeToken: Address, feeReceiver: Address, currentFee: bigint, maxFee: bigint] | undefined
> {
  try {
    return (await readContract(wagmiConfig, {
      chainId: args.chainId,
      abi: dashboardClearMacroAbi,
      address: args.macroAddress,
      functionName: "previewRelayFee",
      args: [args.actionParams, args.signerAddress],
    } as Parameters<typeof readContract>[1])) as readonly [
      Address,
      Address,
      bigint,
      bigint,
    ];
  } catch (error) {
    const isFunctionMissing =
      error instanceof BaseError &&
      error.walk((e) => e instanceof ContractFunctionZeroDataError) != null;
    if (isFunctionMissing) return undefined;
    throw new ClearMacroNotEligibleError("Relay fee preview failed.", {
      cause: error,
    });
  }
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
  const paymentMode = params.paymentMode ?? "usdcx-direct";
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
  // Defensive re-check of what the chip already gated on — guards a stale persisted
  // selection (e.g. switching to a chain without clearMacroPermit2V1). Degrades to the
  // usdcx-direct RELAY — still gasless, covered by its own fee guard — never to self-pay.
  let effectivePaymentMode: ClearMacroPaymentMode = paymentMode;
  if (
    paymentMode === "usdc-permit2" &&
    !chainSupportsPermit2(capabilities, chainId)
  ) {
    effectivePaymentMode = "usdcx-direct";
  }

  // -- Payload assembly (on-chain reads; failures here are still safe to fall back) -----
  const callInfo = getActionCallInfo(action);
  // Exactly ONE of these is produced, per `paymentMode`: the ClearMacro typed data
  // (usdcx-direct signs it) or the Permit2 witness assembly (usdc-permit2 signs a
  // PermitWitnessTransferFrom wrapping it). The signature/POST step branches on which is set.
  let typedData:
    | {
        domain: {
          name: string;
          version: string;
          chainId: number;
          verifyingContract: Address;
        };
        types: Record<string, { type: string; name: string }[]>;
        primaryType: string;
        message: Record<string, unknown>;
      }
    | undefined;
  let permit2Assembly:
    | {
        witnessTypes: Record<string, { type: string; name: string }[]>;
        witnessTypeName: string;
        witnessMessage: Record<string, unknown>;
        feeToken: Address;
        underlyingToken: Address;
        underlyingDecimals: number;
        requiredUnderlyingAmount: bigint;
      }
    | undefined;
  let encodedPayload: Hex;
  // The raw encoded action (`encode<Action>` output). Hoisted so the post-assembly fee-readiness
  // guard can pass it to `previewRelayFee` without re-reading it.
  let actionParams: Hex;
  // Hoisted for the Permit2 deadline (`security.validBefore`) in the signature step.
  let security: ClearMacroSecurity;
  try {
    const nonce = (await readContract(wagmiConfig, {
      chainId,
      abi: clearMacroForwarderAbi,
      address: forwarderAddress,
      functionName: "getNonce",
      args: [signerAddress, 0n],
    })) as bigint;

    actionParams = (await readContract(wagmiConfig, {
      chainId,
      abi: dashboardClearMacroAbi,
      address: macroAddress,
      functionName: callInfo.encodeFunctionName,
      args: [CLEAR_MACRO_LANG, callInfo.tuple],
    } as Parameters<typeof readContract>[1])) as Hex;

    security = {
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

    // Resolve the Permit2 fee funding up-front. Unfundable (feeless macro, or no resolvable
    // ERC-20 underlying) degrades to the usdcx-direct relay — a feeless macro needs no
    // funding at all, and otherwise the fee simply comes from the fee token, covered by the
    // usdcx guard below. Sized against maxFee, not currentFee: schedule state can change
    // between signing and execution, and surplus wrapped fee token stays with the signer.
    let permit2Funding:
      | {
          feeToken: Address;
          underlyingToken: Address;
          underlyingDecimals: number;
          requiredUnderlyingAmount: bigint;
        }
      | undefined;
    if (effectivePaymentMode === "usdc-permit2") {
      const feeQuote = await readRelayFeeQuote(wagmiConfig, {
        chainId,
        macroAddress,
        actionParams,
        signerAddress,
      });
      const feeToken = feeQuote?.[0];
      const maxFee = feeQuote?.[3] ?? 0n;
      const feeTokenEntry =
        feeToken && maxFee > 0n
          ? findTokenFromTokenList({ chainId, address: feeToken })
          : undefined;
      // Only a Wrapper Super Token has an ERC-20 underlying that Permit2 can pull.
      const underlyingAddress =
        feeTokenEntry?.type === TokenType.WrapperSuperToken &&
        "underlyingAddress" in feeTokenEntry &&
        feeTokenEntry.underlyingAddress
          ? (feeTokenEntry.underlyingAddress as Address)
          : undefined;
      const underlyingDecimals = underlyingAddress
        ? findTokenFromTokenList({ chainId, address: underlyingAddress })
            ?.decimals
        : undefined;
      if (feeToken && maxFee > 0n && underlyingAddress && underlyingDecimals != null) {
        permit2Funding = {
          feeToken,
          underlyingToken: underlyingAddress,
          underlyingDecimals,
          requiredUnderlyingAmount: feeToUnderlyingUnitsCeil(
            maxFee,
            underlyingDecimals
          ),
        };
      } else {
        console.warn(
          "Clear Macro Permit2 fee funding unavailable (feeless macro or unresolvable underlying); paying any fee from the fee token instead."
        );
        effectivePaymentMode = "usdcx-direct";
      }
    }

    if (effectivePaymentMode === "usdcx-direct") {
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

      const { actionMessage, securityMessage } = buildActionSecurityMessages(
        actionTypeFields,
        securityTypeFields,
        action,
        description,
        security
      );

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
    } else {
      // usdc-permit2: the fee is pulled from the fee token's UNDERLYING (USDC) via a single
      // Permit2 PermitWitnessTransferFrom whose witness binds this exact ClearMacro payload;
      // the forwarder wraps it to the fee token (credited to the signer) just-in-time.
      const {
        feeToken,
        underlyingToken,
        underlyingDecimals,
        requiredUnderlyingAmount,
      } = permit2Funding!;

      const [witnessTypeString, description, witnessHashOnChain] =
        await Promise.all([
          readContract(wagmiConfig, {
            chainId,
            abi: clearMacroForwarderAbi,
            address: forwarderAddress,
            functionName: "getPermit2WitnessTypeString",
            args: [macroAddress, encodedPayload],
          } as Parameters<typeof readContract>[1]) as Promise<string>,
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
            functionName: "getPermit2WitnessStructHash",
            args: [macroAddress, encodedPayload, feeToken],
          } as Parameters<typeof readContract>[1]) as Promise<Hex>,
        ]);

      // Same parsed-name discipline as the ClearMacro typed data: the witness type string is
      // Uniswap SignatureTransfer convention — `<WitnessType> witness)<sub-type defs...>` —
      // so the witness primary type name is everything before " witness)".
      const witnessTypes = parseEIP712TypeDef(witnessTypeString);
      const witnessTypeName = witnessTypeString.split(" witness)")[0]?.trim();
      const witnessFields = witnessTypeName
        ? witnessTypes[witnessTypeName]
        : undefined;
      if (!witnessTypeName || !witnessFields) {
        throw new ClearMacroNotEligibleError(
          `Unexpected Permit2 witness type string: "${witnessTypeString}".`
        );
      }
      // A witness type named like the fixed outer type would collide in the final `types`
      // object (see buildPermit2Types) — a drifted/hostile type string, degrade to fallback.
      if (
        witnessTypeName === "PermitWitnessTransferFrom" ||
        witnessTypes["PermitWitnessTransferFrom"]
      ) {
        throw new ClearMacroNotEligibleError(
          "Permit2 witness type collides with the reserved PermitWitnessTransferFrom outer type."
        );
      }
      const actionField = witnessFields.find((f) => f.name === "action");
      const securityField = witnessFields.find((f) => f.name === "security");
      const actionTypeFields = actionField
        ? witnessTypes[actionField.type]
        : undefined;
      const securityTypeFields = securityField
        ? witnessTypes[securityField.type]
        : undefined;
      if (!actionField || !securityField || !actionTypeFields || !securityTypeFields) {
        throw new ClearMacroNotEligibleError(
          "Unexpected Permit2 witness shape (expected action + security fields)."
        );
      }
      const { actionMessage, securityMessage } = buildActionSecurityMessages(
        actionTypeFields,
        securityTypeFields,
        action,
        description,
        security
      );

      const witnessMessage: Record<string, unknown> = {};
      for (const field of witnessFields) {
        const value =
          field.name === "upgradeSuperToken"
            ? feeToken
            : field.name === "action"
              ? actionMessage
              : field.name === "security"
                ? securityMessage
                : undefined;
        if (value === undefined) {
          throw new ClearMacroNotEligibleError(
            `No value for Permit2 witness field "${field.name}".`
          );
        }
        witnessMessage[field.name] = value;
      }

      // Permit2 analog of the getDigest pre-check: the locally hashed witness must equal the
      // forwarder's struct hash, anchoring the drift-prone ClearMacro/Action/Security portion
      // to the chain. The fixed outer Permit2 fields (permitted/spender/nonce/deadline) are
      // ours to control directly.
      const witnessHashLocal = hashStruct({
        data: witnessMessage,
        primaryType: witnessTypeName,
        types: witnessTypes,
      });
      if (witnessHashLocal.toLowerCase() !== witnessHashOnChain.toLowerCase()) {
        throw new ClearMacroNotEligibleError(
          `Locally computed Permit2 witness struct hash (${witnessHashLocal}) does not match the forwarder's getPermit2WitnessStructHash (${witnessHashOnChain}).`
        );
      }

      permit2Assembly = {
        witnessTypes,
        witnessTypeName,
        witnessMessage,
        feeToken,
        underlyingToken,
        underlyingDecimals,
        requiredUnderlyingAmount,
      };
    }
  } catch (error) {
    if (error instanceof ClearMacroNotEligibleError) throw error;
    throw new ClearMacroNotEligibleError(
      "Clear Macro payload assembly failed.",
      { cause: error }
    );
  }

  // -- Fee readiness (pre-signature) ----------------------------------------------------
  // Placed AFTER the assembly try/catch on purpose: a fee shortfall must surface as its own
  // error, NOT be wrapped as ClearMacroNotEligibleError (which silently self-pays). The
  // `previewRelayFee` read tolerates ONLY a macro without the function (older/feeless —
  // nothing to guard, proceed); any other read failure degrades to self-pay via
  // `readRelayFeeQuote` instead of silently skipping the guard. The usdc-permit2 mode funds
  // the fee from USDC (the wrap creates the USDCx), so it checks USDC balance + Permit2
  // allowance instead of this USDCx check. Keyed on the assembled artifact (not the
  // requested mode) so a permit2 request that degraded to usdcx-direct is guarded too.
  if (typedData) {
    const feeQuote = await readRelayFeeQuote(wagmiConfig, {
      chainId,
      macroAddress,
      actionParams,
      signerAddress,
    });

    const feeToken = feeQuote?.[0];
    // Gate on maxFee (the new-schedule upper bound), not currentFee: a schedule row can be
    // deleted/executed between signing and relay execution, pushing the charge up to maxFee —
    // so requiring maxFee avoids signing into a relay revert. The fee is tiny, so this never
    // meaningfully over-blocks. (maxFee == currentFee for every non-schedule action.)
    const requiredFee = feeQuote?.[3] ?? 0n;
    if (feeToken && requiredFee > 0n) {
      const [availableBalance] = (await readContract(wagmiConfig, {
        chainId,
        abi: superTokenAbi,
        address: feeToken,
        functionName: "realtimeBalanceOfNow",
        args: [signerAddress],
      } as Parameters<typeof readContract>[1])) as readonly [
        bigint,
        bigint,
        bigint,
        bigint,
      ];

      // Same-fee-token adjustment: the action itself can move the fee token within the same
      // batch BEFORE the appended fee transfer — `upgrade` mints it (relaxes the check),
      // `transfer`/`downgrade` spend it (tightens it). A gate, not a guarantee: streams/
      // deposits can still shift the real transferable balance by execution time.
      let effective = availableBalance;
      if (action.superToken.toLowerCase() === feeToken.toLowerCase()) {
        if (action.kind === "upgrade") effective += action.amount;
        else if (action.kind === "transfer" || action.kind === "downgrade")
          effective -= action.amount;
      }

      if (effective < requiredFee) {
        const symbol = (await readContract(wagmiConfig, {
          chainId,
          abi: superTokenAbi,
          address: feeToken,
          functionName: "symbol",
        } as Parameters<typeof readContract>[1]).catch(
          () => "the fee token"
        )) as string;
        throw new ClearMacroInsufficientFeeError(
          `Not enough ${symbol} to pay the up-to-${formatEther(requiredFee)} ${symbol} relay fee ` +
            `(available ${formatEther(effective < 0n ? 0n : effective)} ${symbol}). ` +
            `Top up ${symbol}, or turn the relay option off to send a regular transaction instead.`,
          { feeToken, requiredFee, availableBalance }
        );
      }
    }
  } else if (permit2Assembly) {
    // The wrap mints the USDCx, so the guards here are on the UNDERLYING: enough USDC to
    // cover the permit, and the one-time USDC→Permit2 approval (the chip does it
    // proactively; this is belt-and-suspenders for an allowance race). Both surface —
    // falling back would just fail again, and the chip renders the remedy.
    const {
      feeToken,
      underlyingToken,
      underlyingDecimals,
      requiredUnderlyingAmount,
    } = permit2Assembly;
    // Same-underlying adjustment (the Permit2 analog of the usdcx guard's): an `upgrade`
    // of the fee token pulls its wrap amount from the SAME underlying balance the fee
    // permit draws from — the forwarder pulls the fee first, then the macro's upgrade —
    // so both must be covered together or the batch reverts after the signature.
    const requiredUnderlyingTotal =
      action.kind === "upgrade" &&
      action.superToken.toLowerCase() === feeToken.toLowerCase()
        ? requiredUnderlyingAmount +
          feeToUnderlyingUnitsCeil(action.amount, underlyingDecimals)
        : requiredUnderlyingAmount;
    const underlyingBalance = (await readContract(wagmiConfig, {
      chainId,
      abi: erc20Abi,
      address: underlyingToken,
      functionName: "balanceOf",
      args: [signerAddress],
    })) as bigint;
    if (underlyingBalance < requiredUnderlyingTotal) {
      const symbol = await readContract(wagmiConfig, {
        chainId,
        abi: erc20Abi,
        address: underlyingToken,
        functionName: "symbol",
      }).catch(() => "the fee token");
      const includesWrapAmount =
        requiredUnderlyingTotal > requiredUnderlyingAmount;
      throw new ClearMacroInsufficientFeeError(
        `Not enough ${symbol} to fund the up-to-${formatUnits(requiredUnderlyingTotal, underlyingDecimals)} ${symbol} ` +
          `${includesWrapAmount ? "needed (amount being wrapped + relay fee)" : "relay fee"} ` +
          `(available ${formatUnits(underlyingBalance, underlyingDecimals)} ${symbol}). ` +
          `Top up ${symbol}, switch the fee payment back to the Super Token, or turn the relay option off.`,
        {
          feeToken: underlyingToken,
          requiredFee: requiredUnderlyingTotal,
          availableBalance: underlyingBalance,
        }
      );
    }
    const permit2Allowance = (await readContract(wagmiConfig, {
      chainId,
      abi: erc20Abi,
      address: underlyingToken,
      functionName: "allowance",
      args: [signerAddress, PERMIT2_ADDRESS],
    })) as bigint;
    if (permit2Allowance < requiredUnderlyingAmount) {
      throw new ClearMacroPermit2ApprovalRequiredError(
        "Paying the relay fee from the underlying token requires a one-time Permit2 approval first.",
        {
          token: underlyingToken,
          spender: PERMIT2_ADDRESS,
          required: requiredUnderlyingAmount,
        }
      );
    }
  }

  // -- Pre-signature simulation of the FALLBACK write -----------------------------------
  // A revert here is rethrown as-is (NOT wrapped): it surfaces in the dialog exactly like the
  // self-pay write's own pre-flight gas estimate does — falling back would just revert again,
  // with gas.
  if (params.fallbackSimulationRequest) {
    await simulateContract(wagmiConfig, params.fallbackSimulationRequest);
  }

  // -- Signature. From here on, NEVER fall back (no silent second wallet prompt). -------
  // ONE signature per mode: usdcx-direct signs the ClearMacro digest, usdc-permit2 signs a
  // Permit2 PermitWitnessTransferFrom whose witness binds the same payload — never both.
  params.onPhase?.("awaiting-signature");
  // NOTE: deliberately NO local `runMacro`/`runPermit2AndMacro` simulation in either mode —
  // the forwarder authorizes `security.provider` against msg.sender, so simulating from
  // anyone but the relayer's (unknown) address reverts ProviderNotAuthorized (verified
  // on-chain). Signature validity is already proven by the digest/witness-hash pre-check;
  // the relay runs its own preflight.
  let execution: RelayExecution;
  if (typedData) {
    const signature = await signTypedData(wagmiConfig, {
      account: signerAddress,
      domain: typedData.domain,
      types: typedData.types,
      primaryType: typedData.primaryType,
      message: typedData.message,
    } as Parameters<typeof signTypedData>[1]);

    params.onPhase?.("relaying");

    execution = await createRelayExecution({
      kind: "clearMacroV1",
      chainId,
      macroAddress,
      signerAddress,
      payload: encodedPayload,
      signature,
      metadata: { source: "dashboard" },
    });
  } else if (permit2Assembly) {
    const {
      witnessTypes,
      witnessTypeName,
      witnessMessage,
      feeToken,
      underlyingToken,
      requiredUnderlyingAmount,
    } = permit2Assembly;
    const permitNonce = generatePermit2Nonce();
    const signature = await signTypedData(wagmiConfig, {
      account: signerAddress,
      // The canonical Permit2 domain has no `version` field.
      domain: {
        name: "Permit2",
        chainId,
        verifyingContract: PERMIT2_ADDRESS,
      },
      types: buildPermit2Types(witnessTypes, witnessTypeName),
      primaryType: "PermitWitnessTransferFrom",
      message: {
        permitted: {
          token: underlyingToken,
          amount: requiredUnderlyingAmount,
        },
        spender: forwarderAddress,
        nonce: permitNonce,
        deadline: security.validBefore,
        witness: witnessMessage,
      },
    } as Parameters<typeof signTypedData>[1]);

    params.onPhase?.("relaying");

    // The provider derives the witness on-chain from macroAddress + payload +
    // upgradeSuperToken, so the body carries neither `witness` nor `witnessTypeString`.
    execution = await createRelayExecution({
      kind: "clearMacroPermit2V1",
      chainId,
      macroAddress,
      signerAddress,
      payload: encodedPayload,
      permit2: {
        permit: {
          permitted: {
            token: underlyingToken,
            amount: requiredUnderlyingAmount.toString(),
          },
          nonce: permitNonce.toString(),
          deadline: security.validBefore.toString(),
        },
        spender: forwarderAddress,
        upgradeSuperToken: feeToken,
        signature,
      },
      metadata: { source: "dashboard" },
    });
  } else {
    // Unreachable: the assembly above produces exactly one signable artifact per mode.
    throw new ClearMacroNotEligibleError(
      "Clear Macro assembly produced no signable payload."
    );
  }

  // Durably persist the execution BEFORE polling. From here the signed payload may land
  // on-chain regardless of what the poll observes, so the outcome must never be lost.
  await params.onExecutionCreated?.({
    executionId: execution.id,
    validBefore: Number(execution.validity.validBefore),
  });

  const terminalExecution = await pollRelayExecutionUntilTerminal(execution.id);
  // pollRelayExecutionUntilTerminal only resolves on `succeeded` with a final hash present.
  return {
    hash: getFinalTransactionHash(terminalExecution)!,
    executionId: terminalExecution.id,
  };
}
