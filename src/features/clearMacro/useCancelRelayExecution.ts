import { useMutation } from "@tanstack/react-query";
import { reduxPersistor, useAppDispatch } from "../redux/store";
import { cancelRelayExecution, ClearMacroRelayError } from "./relayApi";
import { relayRecoveryActions } from "./relayRecovery.slice";

/** Why a cancel could not be confirmed. Both outcomes keep the direct write blocked. */
export type CancelRelayFailureReason =
  /** HTTP 409 — already claimed by a relayer. It may still execute. */
  | "too-late"
  /** No answer at all. We cannot tell whether it was cancelled. */
  | "unknown";

export class CancelRelayExecutionError extends Error {
  constructor(
    message: string,
    public readonly reason: CancelRelayFailureReason
  ) {
    super(message);
    this.name = "CancelRelayExecutionError";
  }
}

/**
 * Cancels a relay execution and releases its write guards — but ONLY on a confirmed 2xx.
 *
 * The abandon path is: cancel, get a 2xx, and only then permit the direct write. On a 409 the
 * execution is already claimed and may still land, so the direct write stays blocked; on a
 * network failure the outcome is simply unknown, which has to be treated the same way. This is
 * exactly the `transfer` / `upgrade` / `downgrade` double-spend, so blocking on an unknown
 * outcome is the only safe default.
 *
 * The durable `cancelRequested` flag is set BEFORE the request goes out, so a cancel that races
 * the create POST is still honoured, and the pre-POST replay path resolves that intent by
 * cancelling it rather than resurrecting it.
 *
 * Branches on the HTTP status, never on the error code string: the 409's code is not in the
 * provider's documented list and could not be confirmed without cancelling a real execution.
 */
export function useCancelRelayExecution() {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async ({
      executionId,
      clientRequestId,
    }: {
      executionId: string;
      clientRequestId?: string;
    }) => {
      dispatch(
        relayRecoveryActions.requestCancel({ executionId, clientRequestId })
      );
      await reduxPersistor.flush();

      try {
        // Idempotent: an already-cancelled execution answers 200.
        await cancelRelayExecution(executionId);
      } catch (error) {
        if (error instanceof ClearMacroRelayError && error.status === 409) {
          throw new CancelRelayExecutionError(
            "This gasless transaction is already being submitted and can't be cancelled. Wait for it to finish before sending this action again — submitting it now would run it twice.",
            "too-late"
          );
        }
        throw new CancelRelayExecutionError(
          "The gasless service couldn't be reached, so we can't confirm the cancellation. This action stays blocked until we can — please try again.",
          "unknown"
        );
      }

      // Confirmed. Both guards lift and the entry can go.
      dispatch(relayRecoveryActions.releaseGuard(executionId));
      dispatch(relayRecoveryActions.resolveAndRemove(executionId));
      if (clientRequestId) {
        dispatch(relayRecoveryActions.clearPendingIntent(clientRequestId));
      }
      await reduxPersistor.flush();
    },
  });
}
