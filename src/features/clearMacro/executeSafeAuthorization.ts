import * as Sentry from "@sentry/react";
import type { Address, Hex } from "viem";
import { RelayPhase } from "../../MutationResult";
import {
  cancelRelayExecution,
  createRelayExecution,
  type ClearMacroV1Body,
  type RelayExecution,
} from "./relayApi";
import {
  createSafeAppsSdk,
  deriveSafeMessageHash,
  readSafeAuthorizationContext,
  requestOffChainSigning,
  watchSafeSigning,
  type SafeSigningOutcome,
} from "./safeAuthorization";
import type { SafeEip712TypedData } from "./safeMessageHash";
import { getSafeMessage } from "./safeMessageLookup";

/**
 * The Safe authorization control flow.
 *
 * Built around four facts, each of which was a review finding rather than a first draft:
 *
 * 1. The Safe message hash is computable locally, so the POST does not have to wait for a
 *    signature (`safeMessageHash.ts`).
 * 2. A POST may legitimately precede both the signing threshold being met and the message
 *    being visible to the Transaction Service.
 * 3. A rejection from `signTypedMessage` is AMBIGUOUS at every threshold. The Safe wallet
 *    sends the same bare string for a decline, for a first owner who signed and closed the
 *    modal, and — because it waits 3s after dispatching — even for a sole owner who signed a
 *    1-of-1 and closed quickly. Nothing here may cancel on a rejection alone.
 * 4. The Transaction Service can usually, but not always, resolve that ambiguity.
 *
 * The invariant that follows: the default at every branch point is to KEEP the intent. Only a
 * positive "no message exists" cancels it.
 */

/** What the tx-service probe established about the proposal, if anything. */
export type SafeProposalObservation =
  | { status: "signed" }
  | { status: "found"; confirmations: number }
  | { status: "unknown" };

/**
 * Control-flow signal, not a failure: the execution exists and is waiting for the Safe's
 * owners. Settles the mutation into a pending state without fabricating a transaction hash.
 */
export class ClearMacroSafeAuthorizationPendingError extends Error {
  constructor(
    public readonly executionId: string,
    public readonly validBefore: number,
    /** Provider-returned and URL-validated, so the dialog can offer Review in Safe. */
    public readonly messageLink?: string
  ) {
    super(
      `Waiting for the Safe's owners to approve this gasless transaction (execution ${executionId}).`
    );
    this.name = "ClearMacroSafeAuthorizationPendingError";
  }
}

export type SafeAuthorizationFailureReason =
  /** The wallet returned a hash that is not the one we POSTed. */
  | "hash-mismatch"
  /** The wallet signed the message on chain despite our off-chain request. */
  | "on-chain-signing"
  /** The probe positively established that no proposal exists. */
  | "declined";

export interface SafeAuthorizationCallbacks {
  onPhase?: (phase: RelayPhase) => void;
  /** Persist the pre-POST intent. Awaited, so the caller can flush before the POST goes out. */
  onIntentCreated: (intent: {
    clientRequestId: string;
    safeMessageHash: Hex;
    validBefore: number;
    postBody: string;
    fallbackValidityWindowSeconds: number;
  }) => void | Promise<void>;
  /** Promote the intent to a live execution. Awaited, and flushed before anything else. */
  onExecutionCreated: (info: {
    clientRequestId: string;
    executionId: string;
    validBefore: number;
    fallbackValidityWindowSeconds: number;
    safeMessageHash: Hex;
    messageLink?: string;
    safeThreshold: number;
  }) => void | Promise<void>;
  /**
   * Durably record that a cancel was decided, BEFORE it is attempted. This is what stops the
   * pre-POST replay path resurrecting an intent whose cancellation raced the POST.
   */
  onCancelRequested: (ref: {
    clientRequestId: string;
    executionId?: string;
  }) => void | Promise<void>;
  /** A cancel returned 2xx — the guards may now be released. */
  onCancelConfirmed: (executionId: string) => void | Promise<void>;
  /**
   * The signing request settled in a way that positively cannot complete.
   *
   * Reported rather than thrown: the signing promise is deliberately not awaited, so by the
   * time it settles the mutation has usually finished and there is no error channel left. The
   * caller surfaces this on its own (a toast), which is also the only surface that still exists
   * once the user has closed the dialog.
   */
  onSigningFailed: (failure: {
    reason: SafeAuthorizationFailureReason;
    message: string;
    /** False means the execution may still run, so the direct write must STAY blocked. */
    cancelConfirmed: boolean;
  }) => void;
}

/** How long to keep asking the Transaction Service before believing an absence. */
const PROBE_WINDOW_MS = 30_000;
const PROBE_INTERVAL_MS = 5_000;

export interface SafeAuthorizationArgs {
  chainId: number;
  signerAddress: Address;
  macroAddress: Address;
  encodedPayload: Hex;
  /** The ClearMacro EIP-712 payload — hashed and signed as the SAME object. */
  typedData: SafeEip712TypedData;
  /** Already computed for the forwarder parity check; re-checked against the Safe app's view. */
  innerDigest: Hex;
  validityWindowInSeconds: number;
  callbacks: SafeAuthorizationCallbacks;
}

export interface SafeAuthorizationResult {
  execution: RelayExecution;
  threshold: number;
  safeMessageHash: Hex;
  /** Resolves when the signing request settles; already handled, exposed for tests. */
  signingSettled: Promise<void>;
}

export async function runSafeAuthorization(
  args: SafeAuthorizationArgs
): Promise<SafeAuthorizationResult> {
  const { callbacks } = args;
  const sdk = createSafeAppsSdk();

  // 1. Which Safe, on which chain, at what threshold — the execution-time defence behind the
  //    connector-id gate in the UI. Every mismatch fails closed.
  const context = await readSafeAuthorizationContext(sdk, {
    signerAddress: args.signerAddress,
    chainId: args.chainId,
  });

  // 2. Ask for off-chain signing. A request, not a guarantee.
  await requestOffChainSigning(sdk);

  // 3 & 4. Derive the hash, cross-checked against the wallet's own view of the inner digest.
  const safeMessageHash = await deriveSafeMessageHash(
    sdk,
    context,
    args.typedData,
    args.innerDigest
  );

  // 5. Persist the intent BEFORE the POST. From here the write guards are armed, and an
  //    unanswered POST can be replayed byte-for-byte instead of guessed at.
  const clientRequestId = crypto.randomUUID();
  const validBefore =
    Math.floor(Date.now() / 1000) + args.validityWindowInSeconds;
  const postBody: ClearMacroV1Body = {
    kind: "clearMacroV1",
    chainId: args.chainId,
    macroAddress: args.macroAddress,
    signerAddress: args.signerAddress,
    payload: args.encodedPayload,
    authorization: { type: "safeMessageV1", safeMessageHash },
    clientRequestId,
    metadata: { source: "dashboard" },
  };
  const serializedBody = JSON.stringify(postBody);
  await callbacks.onIntentCreated({
    clientRequestId,
    safeMessageHash,
    validBefore,
    postBody: serializedBody,
    fallbackValidityWindowSeconds: args.validityWindowInSeconds,
  });

  // 6. Start the signing request. Deliberately NOT awaited as the hash source: the POST must
  //    not wait for owners, and the promise's rejection is not an answer.
  callbacks.onPhase?.("awaiting-signature");
  const signingOutcome = watchSafeSigning(sdk, args.typedData);

  // A cancel decided by the signing handler can arrive before the POST returns an id. The
  // durable flag goes out first; this local mirrors it so the POST path can act immediately.
  let executionId: string | undefined;
  let cancelRequested = false;

  const requestCancel = async () => {
    cancelRequested = true;
    await callbacks.onCancelRequested({ clientRequestId, executionId });
  };

  /** Returns whether the cancel was CONFIRMED. An unknown outcome must keep guards armed. */
  const cancelNow = async (): Promise<boolean> => {
    if (!executionId) return false;
    try {
      await cancelRelayExecution(executionId);
      await callbacks.onCancelConfirmed(executionId);
      return true;
    } catch {
      // Includes 409 (already claimed) and an unanswered request. Either way the payload may
      // still land, so the caller must keep the direct write blocked.
      return false;
    }
  };

  // 7. POST immediately, concurrently with the signing request.
  callbacks.onPhase?.("relaying");
  const execution = await createRelayExecution(postBody);
  executionId = execution.id;

  // 8. Promote the intent to a live execution and flush, THEN honour a cancel that raced us.
  await callbacks.onExecutionCreated({
    clientRequestId,
    executionId: execution.id,
    validBefore: Number(execution.validity.validBefore),
    fallbackValidityWindowSeconds: args.validityWindowInSeconds,
    safeMessageHash,
    messageLink: execution.authorization?.messageLink,
    safeThreshold: context.threshold,
  });
  if (cancelRequested) {
    await callbacks.onCancelRequested({
      clientRequestId,
      executionId: execution.id,
    });
    await cancelNow();
  }

  // Never awaited by the caller — and it must never reject, or it becomes an unhandled
  // rejection long after the mutation has settled.
  const signingSettled = handleSigningOutcome({
    outcome: signingOutcome,
    chainId: args.chainId,
    safeMessageHash,
    requestCancel,
    cancelNow,
    onSigningFailed: callbacks.onSigningFailed,
  }).catch(() => {
    // A failure inside the handler itself leaves the intent alone, which is the safe default.
  });

  return {
    execution,
    threshold: context.threshold,
    safeMessageHash,
    signingSettled,
  };
}

async function handleSigningOutcome(args: {
  outcome: Promise<SafeSigningOutcome>;
  chainId: number;
  safeMessageHash: Hex;
  requestCancel: () => Promise<void>;
  cancelNow: () => Promise<boolean>;
  onSigningFailed: SafeAuthorizationCallbacks["onSigningFailed"];
}): Promise<void> {
  const outcome = await args.outcome;

  if (outcome.kind === "signed") {
    if (outcome.messageHash.toLowerCase() === args.safeMessageHash.toLowerCase()) {
      return; // The fast path. Polling or recovery observes the promotion.
    }
    // The owners authorized a hash the wallet derived; the provider is polling ours. The
    // execution is misbound and can never authorize, and it would otherwise hold both guards
    // until the window closes. Cancel it — and do NOT silently re-POST with the wallet's hash:
    // a derivation we do not understand is not one to build a second execution on.
    await args.requestCancel();
    const cancelConfirmed = await args.cancelNow();
    Sentry.captureException(
      new Error(
        `Safe message hash mismatch: wallet returned ${outcome.messageHash}, we derived ${args.safeMessageHash}.`
      )
    );
    args.onSigningFailed({
      reason: "hash-mismatch",
      message:
        "This Safe derived a different message hash than the dashboard did, so the gasless request can't be completed. Nothing was charged — you can try again.",
      cancelConfirmed,
    });
    return;
  }

  if (outcome.kind === "on-chain") {
    // The wallet declined off-chain signing despite the request. Whether the provider would
    // accept an on-chain-signed message is an OPEN QUESTION (it depends on whether it polls
    // ERC-1271 with an empty signature or fetches a prepared signature), so this deliberately
    // does not assume — cancelling and instructing is correct under either answer.
    await args.requestCancel();
    const cancelConfirmed = await args.cancelNow();
    args.onSigningFailed({
      reason: "on-chain-signing",
      message:
        "This Safe signed the message on chain instead of off chain, which the gasless service can't use. Enable off-chain message signing in your Safe's settings and try again.",
      cancelConfirmed,
    });
    return;
  }

  // Rejected — ambiguous. Ask the Transaction Service instead of guessing.
  const proposal = await probeForProposal(args.chainId, args.safeMessageHash);
  if (proposal.status !== "absent") {
    // Found, or we could not tell. Either way: keep the intent.
    return;
  }

  await args.requestCancel();
  const cancelConfirmed = await args.cancelNow();
  if (!cancelConfirmed) {
    // The cancel did not succeed, so the execution may still be live. Keeping it is the safe
    // outcome; the user is offered Cancel again from the pending surface.
    return;
  }
  args.onSigningFailed({
    reason: "declined",
    message:
      "The gasless request was declined in Safe, so it has been cancelled. Nothing was charged.",
    cancelConfirmed: true,
  });
}

/**
 * Polls the Transaction Service until it either finds the proposal or the window closes.
 *
 * A 404 on the first read means nothing — visibility legitimately lags a proposal — so only a
 * 404 that persists across the whole window counts as an absence. Anything else (rate limit,
 * 403, offline, an unmapped chain) yields `"unknown"`, which must never cancel.
 */
async function probeForProposal(
  chainId: number,
  safeMessageHash: Hex
): Promise<{ status: "found"; confirmations: number } | { status: "absent" } | { status: "unknown" }> {
  const deadline = Date.now() + PROBE_WINDOW_MS;
  let sawAbsent = false;
  for (;;) {
    const result = await getSafeMessage(chainId, safeMessageHash);
    if (result.status === "found") {
      return { status: "found", confirmations: result.confirmations };
    }
    if (result.status === "absent") {
      sawAbsent = true;
    } else {
      // An unavailable answer poisons the window: we can no longer claim a sustained absence.
      sawAbsent = false;
    }
    if (Date.now() >= deadline) {
      return sawAbsent ? { status: "absent" } : { status: "unknown" };
    }
    await new Promise((resolve) => setTimeout(resolve, PROBE_INTERVAL_MS));
  }
}
