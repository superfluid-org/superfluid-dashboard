import { useCallback, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useStore } from "react-redux";
import { toast } from "react-toastify";
import {
  Abi,
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
} from "viem";
import * as Sentry from "@sentry/react";
import { useConfig } from "wagmi";
import { getPublicClient, simulateContract, writeContract } from "@wagmi/core";
import { TransactionInfo, TransactionTitle } from "@superfluid-finance/sdk-redux";
import { reduxPersistor, RootState, useAppDispatch } from "../redux/store";
import { useAccount } from "@/hooks/useAccount";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import MutationResult, { RelayPhase } from "../../MutationResult";
import { PendingUpdate } from "../pendingUpdates/PendingUpdate";
import { allNetworks, findNetworkOrThrow } from "../network/networks";
import { ViemFeeOverrides } from "./viemFeeOverrides";
import {
  classifyError,
  hasUserRejectionMessage,
  isContractRevert,
} from "./viemTransactionErrors";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import {
  useClearMacroEnabled,
  useClearMacroPaymentMode,
} from "../settings/appSettingsHooks";
import { ClearMacroAction } from "../clearMacro/dashboardClearMacro";
import {
  isClearMacroSupportedOnNetwork,
  SAFE_CONNECTOR_ID,
} from "../clearMacro/useClearMacroEligibility";
import { useRelayCapabilities } from "../clearMacro/useRelayCapabilities";
import {
  actionFingerprint,
  isBlockedByGuards,
} from "../clearMacro/actionFingerprint";
import { ClearMacroSafeAuthorizationPendingError } from "../clearMacro/executeSafeAuthorization";
import { describeTerminalRelayState } from "../clearMacro/relayStateCopy";
import {
  ClearMacroInsufficientFeeError,
  ClearMacroNotEligibleError,
  ClearMacroPermit2ApprovalRequiredError,
  executeClearMacro,
} from "../clearMacro/executeClearMacro";
import {
  chainSupportsSafeMessage,
  ClearMacroRelayError,
  isRenderableMessageLink,
  type RelayAuthorizationMethod,
} from "../clearMacro/relayApi";
import {
  encodeRelayIntentDisplayMeta,
  relayRecoveryActions,
  selectRelayWriteGuards,
  toJsonSafe,
} from "../clearMacro/relayRecovery.slice";
import { trackTransaction } from "./trackTransaction";
import { WriteMutability } from "./operations";

export interface SuperfluidWriteArgs<
  TAbi extends Abi = Abi,
  TFunctionName extends ContractFunctionName<
    TAbi,
    WriteMutability
  > = ContractFunctionName<TAbi, WriteMutability>,
  // `args` is its own (inferred) type parameter, mirroring wagmi's
  // `WriteContractParameters` — the literal infers as a tuple first and is then
  // constraint-checked, which a bare `ContractFunctionArgs<...>` property can't do
  // (the unresolved conditional gives the array literal no tuple context).
  TArgs extends ContractFunctionArgs<
    TAbi,
    WriteMutability,
    TFunctionName
  > = ContractFunctionArgs<TAbi, WriteMutability, TFunctionName>,
> {
  chainId: number;
  abi: TAbi;
  address: Address;
  functionName: TFunctionName;
  args: TArgs;
  /**
   * Native value sent with the call (payable batchCall, native-asset upgrade).
   * Only accepted when the selected function is payable (wagmi's `GetValue`
   * pattern); widened usage (e.g. spread `subOperationsWriteFragment` results)
   * stays permissive via the `Abi extends TAbi` fallback.
   */
  value?: Abi extends TAbi
    ? bigint
    : TFunctionName extends Extract<
          TAbi[number],
          { type: "function"; stateMutability: "payable" }
        >["name"]
      ? bigint
      : never;
  /** Tracked-transaction title shown in the drawer. */
  title: TransactionTitle;
  /** Per-operation titles shown in the drawer for batched calls (kept in `extraData`). */
  subTransactionTitles?: TransactionTitle[];
  extraData?: Record<string, unknown>;
  /**
   * Optional per-call overrides merged OVER the automatically resolved ones (gas API fee
   * recommendation + smart-wallet detection + advanced global overrides). Only needed for
   * special cases, e.g. a fixed gas limit for quirky tokens.
   */
  overrides?: ViemFeeOverrides;
  /** Build the optimistic pending updates once the hash is known (ids/hash filled by caller). */
  getPendingUpdates?: (hash: string) => PendingUpdate[];
  /**
   * The Clear Macro equivalent of this write. When set AND the relay path is enabled +
   * eligible, the write executes gaslessly via the relay (one EIP-712 signature); any
   * pre-signature miss falls back to the normal path below.
   */
  clearMacro?: ClearMacroAction;
  /**
   * Caller intent: this write must go through the relay — its batch pays for a service
   * (scheduling) via the macro's fee. Fail closed instead of self-paying: a pre-signature
   * relay miss (`ClearMacroNotEligibleError`) surfaces as a readable error rather than
   * silently falling back, and if the relay gate below can't engage at all (e.g. the
   * toggle raced off), the write throws instead of executing direct.
   */
  clearMacroRequired?: boolean;
}

/**
 * Feature hooks pass a builder so that their preflight work (RPC reads, operation assembly,
 * validation) runs INSIDE the mutation lifecycle — failures there must surface through
 * `result` (dialog/error UI) just like the legacy RTK Query `queryFn` did, and `isLoading`
 * must cover them so buttons can't double-submit while reads are pending.
 */
export type SuperfluidWriteArgsBuilder = () =>
  | SuperfluidWriteArgs
  | Promise<SuperfluidWriteArgs>;

const toSerializedError = (error: Error) => ({
  name: error.name,
  // viem errors expose a concise `shortMessage`; fall back to the full message.
  message: (error as { shortMessage?: string }).shortMessage ?? error.message,
  // Stable, viem-aware category for the error dialog to switch on (the viem error CLASS is lost
  // once serialized to `{ name, message }`, so we classify here while the live error is in hand).
  code: classifyError(error),
});

// sdk-core parity: gas limit = estimate + 20%. Protects Superfluid agreement calls and Host
// `batchCall`s whose real on-chain gas exceeds a bare estimate (SuperApp callbacks, solvency
// branches). Integer-only bigint math.
const GAS_LIMIT_MULTIPLIER_NUM = 120n;
const GAS_LIMIT_MULTIPLIER_DEN = 100n;

/**
 * Shared core for wagmi-hook based Superfluid writes. One TanStack `useMutation` spans the
 * whole trigger — preflight (args builder) → gas estimate + buffer → `writeContract` → handing
 * the hash to the Redux tracker via `trackTransaction` — so the entire lifecycle is
 * library-managed (no hand-rolled loading/error state). Returns a `result` shaped like RTK
 * Query's mutation result so the existing `TransactionBoundary` / `TransactionDialog` /
 * button UX consume it unchanged.
 */
export function useSuperfluidWriteContract() {
  const config = useConfig();
  const dispatch = useAppDispatch();
  const { address, connector } = useAccount();
  const getTransactionOverrides = useGetTransactionOverrides();
  const clearMacroEnabled = useClearMacroEnabled();
  const clearMacroPaymentMode = useClearMacroPaymentMode();
  const { isEOA, visibleAddress } = useVisibleAddress();
  const store = useStore<RootState>();
  const { data: relayCapabilities } = useRelayCapabilities();
  const [relayPhase, setRelayPhase] = useState<RelayPhase | undefined>();
  const [safeAwaitingAuthorization, setSafeAwaitingAuthorization] = useState<
    | {
        executionId: string;
        validBefore: number;
        messageLink?: string;
        clientRequestId?: string;
      }
    | undefined
  >();
  const [relayStatusUnknown, setRelayStatusUnknown] = useState<
    { executionId: string } | undefined
  >();

  const mutation = useMutation<
    TransactionInfo,
    Error,
    SuperfluidWriteArgs | SuperfluidWriteArgsBuilder
  >({
    // Clear a stale phase from a previous run (it is deliberately left set after success
    // so the success view can note the relay).
    onMutate: () => {
      setRelayPhase(undefined);
      setRelayStatusUnknown(undefined);
      setSafeAwaitingAuthorization(undefined);
    },
    // Centralized Sentry logging for write failures. The old RTK Query write path got this from
    // the `sentryErrorLogger` Redux middleware (store.ts), which no longer sees these wagmi /
    // TanStack mutations. Skip user-side, non-actionable conditions the dialog already explains:
    // user rejections (viem-typed + message-only, both walking the cause chain) and insufficient
    // native funds. Contract reverts are intentionally logged — they can signal a real
    // tx-construction bug.
    onError: (error) => {
      // A post-signature poll timeout is an expected "status unknown", not a failure — the
      // background poller keeps resolving it. Don't log it as an error.
      if (
        error instanceof ClearMacroRelayError &&
        error.code === "POLL_TIMEOUT"
      )
        return;
      // A Safe authorization that is simply still open. Control flow, not a failure.
      if (error instanceof ClearMacroSafeAuthorizationPendingError) return;
      // A known fee-balance shortfall surfaced before signing — the dialog explains it; not a bug.
      if (error instanceof ClearMacroInsufficientFeeError) return;
      // A missing one-time Permit2 approval, surfaced before signing — the chip offers the
      // approve; expected user-side condition, not a bug.
      if (error instanceof ClearMacroPermit2ApprovalRequiredError) return;
      const code = classifyError(error); // walks for UserRejectedRequestError / InsufficientFundsError
      if (code === "USER_REJECTED" || code === "INSUFFICIENT_FUNDS") return;
      if (hasUserRejectionMessage(error)) return; // rejections viem doesn't type (auto-wrap, Cypress)
      Sentry.captureException(error);
    },
    mutationFn: async (argsOrBuilder) => {
      if (!address) throw new Error("No connected account.");

      const params =
        typeof argsOrBuilder === "function"
          ? await argsOrBuilder()
          : argsOrBuilder;

      const network = findNetworkOrThrow(allNetworks, params.chainId);
      const resolvedOverrides = await getTransactionOverrides(network);

      // `gas: 0n` signals a smart wallet (e.g. Gnosis Safe): it estimates gas itself, and
      // simulating against the EOA-style call context would be misleading (4337/delegatecall
      // execution differs), so omit gas and skip simulation entirely.
      const { gas, ...feeOverrides } = {
        ...resolvedOverrides,
        ...params.overrides,
      };
      const isSmartWallet = gas === 0n;

      const request = {
        chainId: params.chainId,
        abi: params.abi,
        address: params.address,
        functionName: params.functionName,
        args: params.args,
        account: address,
        ...(params.value !== undefined ? { value: params.value } : {}),
        ...feeOverrides,
        ...(!isSmartWallet && gas !== undefined ? { gas } : {}),
        // The concrete ABI/functionName/args typing lives at the per-use-case call sites;
        // the generic core widens to `Abi`, so we relax the request type here.
      } as Parameters<typeof writeContract>[1];

      // Clear Macro relay path: gasless execution off one EIP-712 signature. Fee
      // overrides don't apply (the relay provider pays gas). Gated on `isEOA === true`
      // (not just the gas sentinel — `isEOA` is null while still classifying the wallet).
      // `isEOA` classifies the VISIBLE address, so it only stands for the signer when
      // they are the same account (i.e. not impersonating).
      // How this signer would authorize the digest, resolved BEFORE entering the relay branch
      // so the no-fallback rule below can key off a settled answer. A Safe only qualifies once
      // the provider positively confirms `safeMessageV1` for this chain — otherwise it stays
      // ineligible and takes the ordinary paid path, which is the right outcome on a
      // signature-only chain.
      const authorizationMethod: RelayAuthorizationMethod | undefined =
        isEOA === true
          ? "signature"
          : isEOA === false &&
              connector?.id === SAFE_CONNECTOR_ID &&
              relayCapabilities &&
              chainSupportsSafeMessage(relayCapabilities, params.chainId)
            ? "safeMessageV1"
            : undefined;
      const isSafeAuthorization = authorizationMethod === "safeMessageV1";

      const clearMacroFingerprint = params.clearMacro
        ? actionFingerprint(params.clearMacro)
        : undefined;

      // Guard A — nonce collision. The forwarder uses nonce key 0, so a second gasless payload
      // for the same signer reuses the same on-chain nonce and creates competing intents that
      // can both admit. Best-effort and per-browser: another tab, device, or Safe owner can
      // still collide. Provider-side nonce exclusion is the intended real mechanism.
      const activeGuards = selectRelayWriteGuards(store.getState());
      const isGaslessBlockedByGuardA = isBlockedByGuards(
        activeGuards,
        { chainId: params.chainId, signerAddress: address },
        "A"
      );

      if (
        params.clearMacro &&
        clearMacroEnabled &&
        authorizationMethod !== undefined &&
        !isGaslessBlockedByGuardA &&
        visibleAddress?.toLowerCase() === address.toLowerCase() &&
        // The smart-wallet gas sentinel disqualifies the EOA path but NOT a Safe — a Safe is
        // expected to be a smart wallet, and it never reaches a self-paid estimate anyway.
        (isSafeAuthorization || !isSmartWallet) &&
        // Same predicate the UI eligibility hook uses (network is derived from
        // `params.chainId` above, so this covers the forwarder check too) — it also
        // carries the NEXT_PUBLIC_DISABLE_CLEAR_MACRO kill switch, so the gate the
        // user sees and the gate that executes cannot drift.
        isClearMacroSupportedOnNetwork(network) &&
        network.dashboardClearMacro
      ) {
        const clearMacroAction = params.clearMacro;
        // Set once the relay accepts the signed payload — from here the execution exists and an
        // error must hand off to recovery, never leave the entry stuck "live".
        let createdExecutionId: string | undefined;
        // The pre-POST intent this run created, if any — so the catch below can hand it over.
        let safeClientRequestId: string | undefined;
        try {
          const { hash, executionId } = await executeClearMacro(config, {
            chainId: params.chainId,
            signerAddress: address,
            action: clearMacroAction,
            macroAddress: network.dashboardClearMacro.macroAddress,
            // Simulating the fallback write surfaces reverts (insufficient balance,
            // existing stream, ...) in the dialog before the signature prompt.
            fallbackSimulationRequest:
              request as Parameters<typeof simulateContract>[1],
            // The persisted chip selection: pay the fee from USDCx directly, or fund it
            // from USDC via Permit2.
            paymentMode: clearMacroPaymentMode,
            // Forced writes can't offer "turn the relay off" as a fee-shortfall remedy.
            relayRequired: params.clearMacroRequired,
            onPhase: setRelayPhase,
            // Persist the execution the moment the relay accepts the signed payload, BEFORE
            // polling — and flush so a closed tab / reload / poll timeout can't orphan it.
            authorizationMethod,
            actionFingerprint: clearMacroFingerprint,
            // Persisted BEFORE the POST for the Safe path: the guards are armed from here, and
            // an unanswered POST can then be replayed byte-for-byte instead of guessed at.
            onIntentCreated: async (intent) => {
              safeClientRequestId = intent.clientRequestId;
              dispatch(
                relayRecoveryActions.registerPendingIntent({
                  clientRequestId: intent.clientRequestId,
                  // This mutation is about to POST it itself, so the background replayer must
                  // leave it alone until nothing owns it (a reload, or the hand-off below).
                  ownership: "live",
                  chainId: params.chainId,
                  signerAddress: address,
                  safeMessageHash: intent.safeMessageHash,
                  validBefore: intent.validBefore,
                  postBody: intent.postBody,
                  actionFingerprint: clearMacroFingerprint ?? "",
                  cancelRequested: false,
                  actionKind: clearMacroAction.kind,
                  createdAt: Date.now(),
                  replayAttempts: 0,
                  displayMeta: encodeRelayIntentDisplayMeta({
                    title: params.title,
                    subTransactionTitles: params.subTransactionTitles,
                    extraData: toJsonSafe(params.extraData),
                  }),
                })
              );
              await reduxPersistor.flush();
            },
            onCancelRequested: async (ref) => {
              dispatch(relayRecoveryActions.requestCancel(ref));
              await reduxPersistor.flush();
            },
            onCancelConfirmed: async (executionId) => {
              dispatch(relayRecoveryActions.releaseGuard(executionId));
              await reduxPersistor.flush();
            },
            // The signing promise is not awaited, so this can fire long after the mutation
            // settled and the dialog closed. A toast is the only surface that outlives both.
            onSigningFailed: ({ message, cancelConfirmed }) => {
              toast.error(
                cancelConfirmed
                  ? message
                  : `${message} We couldn't confirm the cancellation, so this action stays blocked until we can.`,
                { position: "bottom-right", autoClose: false }
              );
            },
            onSafeAuthorizationPending: async () => {
              // The entry is already persisted by `onExecutionCreated`; the mutation settles
              // through the thrown pending signal, handled in the catch below.
            },
            onExecutionCreated: async ({
              executionId,
              validBefore,
              fallbackValidityWindowSeconds,
              clientRequestId,
              safeMessageHash,
              messageLink,
              safeThreshold,
            }) => {
              createdExecutionId = executionId;
              dispatch(
                relayRecoveryActions.registerLive({
                  executionId,
                  chainId: params.chainId,
                  signerAddress: address,
                  validBefore,
                  fallbackValidityWindowSeconds,
                  title: params.title,
                  subTransactionTitles: params.subTransactionTitles,
                  extraData: toJsonSafe(params.extraData),
                  actionKind: clearMacroAction.kind,
                  createdAt: Date.now(),
                  ...(safeMessageHash
                    ? {
                        authorizationType: "safeMessageV1" as const,
                        safeMessageHash,
                        messageLink: isRenderableMessageLink(messageLink)
                          ? messageLink
                          : undefined,
                        safeThreshold,
                        actionFingerprint: clearMacroFingerprint,
                        clientRequestId,
                      }
                    : {}),
                })
              );
              await reduxPersistor.flush();
            },
          });

          await dispatch(
            trackTransaction({
              hash,
              chainId: params.chainId,
              signerAddress: address,
              title: params.title,
              extraData: {
                ...(params.subTransactionTitles
                  ? { subTransactionTitles: params.subTransactionTitles }
                  : {}),
                ...params.extraData,
                clearMacroExecutionId: executionId,
              },
              pendingUpdates: params.getPendingUpdates?.(hash),
            })
          );
          // Tracked in-session; the background poller must not also handle it.
          dispatch(relayRecoveryActions.resolveAndRemove(executionId));

          return { hash, chainId: params.chainId };
        } catch (error) {
          // Whatever happens from here, this mutation is no longer the owner of its pre-POST
          // intent. If one is still persisted its POST was never resolved, so hand it to the
          // background replayer rather than leaving it inert while it holds the write guards.
          if (safeClientRequestId) {
            dispatch(
              relayRecoveryActions.handIntentToRecovery(safeClientRequestId)
            );
          }
          if (
            error instanceof ClearMacroSafeAuthorizationPendingError
          ) {
            // Not a failure: the execution exists and the Safe's owners are still approving
            // it. Settle the mutation through a dedicated phase rather than fabricating a
            // transaction hash, and hand the execution to the background poller.
            dispatch(
              relayRecoveryActions.handOffToRecovery(error.executionId)
            );
            setRelayPhase("safe-awaiting-authorization");
            setSafeAwaitingAuthorization({
              executionId: error.executionId,
              validBefore: error.validBefore,
              messageLink: error.messageLink,
              clientRequestId: safeClientRequestId,
            });
            throw error;
          } else if (error instanceof ClearMacroNotEligibleError) {
            if (isSafeAuthorization) {
              // A Safe never falls back to a paid write. Gasless→paid is not a cost detail
              // here: it is a different multi-owner ceremony with its own co-signer round and
              // its own gas, and the user opted into gasless explicitly. If they want the paid
              // path they turn gasless off themselves, which goes through the guards.
              throw new Error(
                "This Safe's gasless transaction couldn't be prepared, so nothing was sent. Turn off the gasless option if you'd rather send it as a normal Safe transaction.",
                { cause: error }
              );
            }
            if (params.clearMacroRequired) {
              // A forced write must never self-pay (the relay fee IS the payment for the
              // scheduling service) — surface a readable message instead of falling back.
              // The dialog renders messages verbatim, so the raw cause (digest mismatch,
              // capabilities fetch failure, ...) must not be the message itself.
              throw new Error(
                "The gasless transaction service is unavailable right now. Please try again later.",
                { cause: error }
              );
            }
            // Nothing was signed — fall through to the normal write path below.
            // The cause carries the real reason (failed fetch/read, field mismatch).
            console.warn(
              "Clear Macro relay not eligible, falling back to the direct write.",
              error,
              error.cause
            );
            // Surface the gasless→self-pay switch in the dialog. The phase persists through the
            // self-pay `writeContract` that follows (and into success); the dialog narrates it.
            setRelayPhase("fallback");
          } else if (
            error instanceof ClearMacroInsufficientFeeError ||
            error instanceof ClearMacroPermit2ApprovalRequiredError
          ) {
            // Known fee shortfall / missing one-time Permit2 approval, thrown BEFORE signing —
            // surface it (the error dialog shows the message). Deliberately NOT a silent
            // self-pay fallback: the user should decide to top up, approve, or switch the
            // payment mode in the chip. No execution exists to hand off.
            throw error;
          } else if (error instanceof ClearMacroRelayError) {
            const executionId = error.executionId ?? createdExecutionId;
            if (error.code === "POLL_TIMEOUT") {
              // Signed and accepted, but not confirmed within 120s. Hand the execution to the
              // background poller and surface a distinct "status unknown" state — NOT a hard
              // error, and the user must not retry (a fresh-nonce retry could double-execute).
              if (executionId) {
                dispatch(relayRecoveryActions.handOffToRecovery(executionId));
                setRelayStatusUnknown({ executionId });
              }
              setRelayPhase("relay-status-unknown");
            } else if (executionId) {
              // Terminal failure (reverted/rejected/failed/expired/canceled). A confirmed
              // terminal state is a positive answer, so the guards go with the entry.
              dispatch(relayRecoveryActions.releaseGuard(executionId));
              dispatch(relayRecoveryActions.resolveAndRemove(executionId));
              if (error.state && error.state !== "succeeded") {
                // Render the SAME distinct copy the recovery path uses rather than the raw
                // provider string. Collapsing a cancellation, a preflight revert and a real
                // failure into one message is wrong in different ways for each — and telling a
                // user it is "safe to try again" is not always true.
                const copy = describeTerminalRelayState(
                  error.state,
                  error.code,
                  executionId
                );
                throw new Error(`${copy.title}. ${copy.body}`, { cause: error });
              }
            }
            throw error;
          } else {
            // A non-relay error (e.g. network) AFTER the execution was created: the signed
            // payload may still land, so hand off to recovery + "status unknown" rather than
            // leaving the persisted entry stuck "live". Pre-creation errors (signature
            // rejection, etc.) have no execution and surface as normal errors.
            if (createdExecutionId) {
              dispatch(relayRecoveryActions.handOffToRecovery(createdExecutionId));
              setRelayStatusUnknown({ executionId: createdExecutionId });
              setRelayPhase("relay-status-unknown");
            }
            throw error;
          }
        }
      } else if (
        // §6's point, not just its letter: a Safe that opted into gasless must NEVER silently
        // end up in a paid multi-owner ceremony. Two ways the relay branch above declines to
        // engage without the user choosing it:
        //   - Guard A is holding (another gasless request owns this signer's forwarder nonce);
        //   - the provider's capabilities have not resolved, so `authorizationMethod` is
        //     undefined even though this IS a Safe App with gasless switched on.
        // Both are "not yet", not "send it the expensive way". Fail closed and say which.
        params.clearMacro &&
        clearMacroEnabled &&
        isEOA === false &&
        connector?.id === SAFE_CONNECTOR_ID &&
        visibleAddress?.toLowerCase() === address.toLowerCase() &&
        isClearMacroSupportedOnNetwork(network) &&
        // Only when the answer is genuinely UNRESOLVED. A settled "this chain is
        // signature-only" is a different thing: there the ordinary paid path is correct, the
        // UI already says gasless isn't available here, and blocking would strand the user.
        (isGaslessBlockedByGuardA || !relayCapabilities)
      ) {
        throw new Error(
          isGaslessBlockedByGuardA
            ? "Another gasless transaction for this Safe is still open. Wait for it to finish or cancel it, then try again."
            : "The gasless service can't be reached right now, so this Safe transaction wasn't sent. Try again in a moment, or turn off the gasless option to send it as a normal Safe transaction."
        );
      } else if (params.clearMacroRequired) {
        // The caller demanded the relay but the gate above couldn't engage (toggle raced
        // off, wallet reclassified, ...). The form keeps its submit disabled in these
        // states, so this is a belt-and-suspenders guard — fail closed, never self-pay.
        //
        // Guard A gets its own message: "turn on the gasless option" is not the remedy when the
        // option is already on and the real blocker is another gasless request holding the
        // signer's forwarder nonce.
        throw new Error(
          isGaslessBlockedByGuardA
            ? "Another gasless transaction for this account is still open. Wait for it to finish or cancel it, then try again."
            : "This change needs to be sent gaslessly. Turn on the gasless option and try again."
        );
      }

      // Guard B — double spend. THE single enforcement point: every write that is not going
      // through the relay passes here. While an unresolved gasless intent exists for this
      // exact action, writing it directly could execute it twice — the relay can still run the
      // intent, and a direct write does not consume the forwarder nonce, so `transfer`,
      // `upgrade` and `downgrade` would move funds a second time.
      //
      // Releasing this requires a cancel that returned 2xx, never a timeout. Blocking on an
      // unknown cancel outcome is the only safe default.
      //
      // What it catches: the escape-hatch affordance, where the action is the same object, and
      // a hand-rebuilt identical action. What it does NOT catch: a semantically equivalent
      // action composed differently. It is a guard, not a proof.
      if (
        clearMacroFingerprint &&
        isBlockedByGuards(
          selectRelayWriteGuards(store.getState()),
          {
            chainId: params.chainId,
            signerAddress: address,
            actionFingerprint: clearMacroFingerprint,
          },
          "B"
        )
      ) {
        throw new Error(
          "A gasless version of this transaction is still open and could still go through. Cancel it first — sending this now could run it twice."
        );
      }

      // Unified pre-flight (sdk-core parity): one `eth_estimateGas` that both buffers the gas
      // limit (+20%) AND surfaces reverts before the wallet prompt. Skipped for smart wallets
      // (estimate themselves) and when a caller supplied an explicit `gas` override. The Clear
      // Macro relay path already returned above, so this only runs for self-pay writes
      // (including the relay-fallback case, where self-paying is now correct).
      //
      // We only *throw* a revert when the signer is a confirmed EOA paying for its own call
      // (mirrors the relay branch's gate). While the wallet is still being classified
      // (`isEOA === null`), a smart wallet hasn't been tagged with the `gas: 0n` sentinel yet, so
      // an EOA-style estimate against it could falsely revert — during that window we still buffer
      // on success but never block: fall back to wallet estimation instead.
      const isConfirmedEoaSigner =
        isEOA === true &&
        visibleAddress?.toLowerCase() === address.toLowerCase();
      if (!isSmartWallet && gas === undefined) {
        const publicClient = getPublicClient(config, { chainId: params.chainId });
        try {
          const estimated = await publicClient!.estimateContractGas({
            abi: params.abi,
            address: params.address,
            functionName: params.functionName,
            args: params.args,
            account: address,
            ...(params.value !== undefined ? { value: params.value } : {}),
            // Plain eth_estimateGas, no fee prepay. json-rpc/injected accounts already skip
            // fee-fill; `prepare: false` pins that + skips the prepare round-trip, keeping the
            // pre-pay check at `balance >= value` (passes for non-payable value=0 and for native
            // wraps the form already balance-checks).
            prepare: false,
          } as Parameters<NonNullable<typeof publicClient>["estimateContractGas"]>[0]);
          request.gas =
            (estimated * GAS_LIMIT_MULTIPLIER_NUM) / GAS_LIMIT_MULTIPLIER_DEN;
        } catch (error) {
          // A real on-chain revert surfaces in the dialog (sdk-core parity) — but only for a
          // confirmed EOA signer; while classification is pending we never block (see above).
          if (isConfirmedEoaSigner && isContractRevert(error)) throw error;
          // Any other failure (transport/timeout, unsupported method, node hiccup, gas-cap, or
          // `publicClient` undefined) — log and fall back: omit gas, let the wallet estimate.
          Sentry.captureException(error, { level: "warning" });
        }
      }

      const hash = await writeContract(config, request);

      await dispatch(
        trackTransaction({
          hash,
          chainId: params.chainId,
          signerAddress: address,
          title: params.title,
          extraData: {
            ...(params.subTransactionTitles
              ? { subTransactionTitles: params.subTransactionTitles }
              : {}),
            ...params.extraData,
          },
          pendingUpdates: params.getPendingUpdates?.(hash),
        })
      );

      return { hash, chainId: params.chainId };
    },
  });

  const result: MutationResult<TransactionInfo> = {
    isUninitialized: mutation.isIdle,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error ? toSerializedError(mutation.error) : undefined,
    data: mutation.data,
    relayPhase,
    relayStatusUnknown,
    safeAwaitingAuthorization,
    reset: () => {
      setRelayPhase(undefined);
      setRelayStatusUnknown(undefined);
      setSafeAwaitingAuthorization(undefined);
      mutation.reset();
    },
  };

  const { mutateAsync } = mutation;
  // Generic wrapper so each call infers functionName/args from the concrete ABI
  // (`useMutation` fixes its variables type at hook creation, so the generics must
  // live here). A narrow instantiation is structurally within the widened type, but
  // TS can't prove that through the unresolved `ContractFunctionArgs` conditional,
  // hence the cast.
  const write = useCallback(
    <
      const TAbi extends Abi,
      TFunctionName extends ContractFunctionName<TAbi, WriteMutability>,
      const TArgs extends ContractFunctionArgs<
        TAbi,
        WriteMutability,
        TFunctionName
      >,
    >(
      argsOrBuilder:
        | SuperfluidWriteArgs<TAbi, TFunctionName, TArgs>
        | (() =>
            | SuperfluidWriteArgs<TAbi, TFunctionName, TArgs>
            | Promise<SuperfluidWriteArgs<TAbi, TFunctionName, TArgs>>)
    ) =>
      mutateAsync(
        argsOrBuilder as unknown as
          | SuperfluidWriteArgs
          | SuperfluidWriteArgsBuilder
      ),
    [mutateAsync]
  );

  return { write, result };
}
