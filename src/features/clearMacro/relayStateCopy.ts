import { RelayExecutionState } from "./relayApi";

/**
 * User-facing copy for a terminal relay execution.
 *
 * Previously every non-`succeeded` terminal state collapsed into one string that also told the
 * user it was "safe to try again" — which is wrong for several of them and dangerous for at
 * least one. These are distinguished because the right next action genuinely differs: a
 * preflight revert can be retried after fixing the cause, an expiry can simply be redone, and a
 * cancellation was the user's own doing and needs no remedy at all.
 */
export interface TerminalRelayCopy {
  title: string;
  body: string;
  /** Whether re-submitting the same action is safe. */
  canRetry: boolean;
  severity: "info" | "warning" | "error";
}

export function describeTerminalRelayState(
  state: RelayExecutionState,
  errorCode: string | undefined,
  executionId: string
): TerminalRelayCopy {
  const idSuffix = ` (execution ${executionId})`;

  if (state === "canceled") {
    return {
      title: "Gasless request cancelled",
      body: `You cancelled this gasless request. Nothing was charged.${idSuffix}`,
      canRetry: true,
      severity: "info",
    };
  }

  if (state === "expired" || errorCode === "CLEAR_MACRO_EXPIRED") {
    return {
      title: "Gasless request expired",
      body: `This gasless request expired before the Safe owners approved it. Nothing was charged.${idSuffix}`,
      canRetry: true,
      severity: "warning",
    };
  }

  if (state === "rejected" || errorCode === "PREFLIGHT_REVERTED") {
    return {
      title: "Gasless request can no longer be completed",
      body: `The conditions changed since it was created — for example the balance or the fee moved. Nothing was charged. You can create it again.${idSuffix}`,
      canRetry: true,
      severity: "warning",
    };
  }

  // `reverted` and `failed` keep the existing shape: the transaction was actually attempted, so
  // retrying is a judgement call the user makes with the execution id in hand.
  return {
    title: "Gasless transaction failed",
    body: `A gasless transaction could not be completed${idSuffix}. Check the execution before trying again.`,
    canRetry: false,
    severity: "error",
  };
}

/**
 * The leftover Safe message after a cancel.
 *
 * Cancelling stops the provider's relay only — it does not revoke the Safe message. Co-signers
 * can still confirm it, which is harmless for this execution but alarming to an owner watching
 * the Safe UI, so it has to be said rather than discovered.
 */
export const CANCELLED_SAFE_MESSAGE_NOTE =
  "If you approved it in Safe, the message is still listed there and other owners can still confirm it. Confirming does nothing now, but you can reject it in the Safe app to clear it.";
