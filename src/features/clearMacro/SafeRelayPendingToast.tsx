import { FC } from "react";
import { Stack, Typography } from "@mui/material";
import { SafeRelayPendingActions } from "./SafeRelayPendingActions";

/**
 * The persistent surface for a Safe gasless request that is waiting on its owners.
 *
 * Replaces the plain "still being confirmed, please don't retry" string for Safe entries. That
 * copy is wrong on both halves for a multi-day co-signer wait: nothing is being confirmed yet,
 * and the reason not to retry is not vagueness but a concrete double-spend the user can resolve
 * by cancelling.
 */
export interface SafeRelayPendingToastProps {
  executionId: string;
  clientRequestId?: string;
  /** Unix seconds. */
  validBefore: number;
  /** Provider-returned and URL-validated; absent means no button, never a constructed URL. */
  messageLink?: string;
  /** From the tx-service probe, when it answered. Absent means we do not know. */
  confirmations?: number;
  threshold?: number;
}

export const SafeRelayPendingToast: FC<SafeRelayPendingToastProps> = ({
  executionId,
  clientRequestId,
  validBefore,
  messageLink,
  confirmations,
  threshold,
}) => {
  // Confident copy only when the Transaction Service actually told us a proposal exists.
  // Otherwise the honest version: a rejection cannot distinguish "signed and closed the modal"
  // from "declined" — but the user can, so the decision is theirs.
  const headline =
    confirmations != null
      ? threshold != null
        ? `Waiting for the other owners of this Safe (${confirmations} of ${threshold} approved).`
        : `Waiting for the other owners of this Safe (${confirmations} approved).`
      : "Waiting for the other owners of this Safe.";

  return (
    <Stack data-cy="safe-relay-pending-toast" sx={{ gap: 1 }}>
      <Typography variant="body2" translate="yes" sx={{ fontWeight: 500 }}>
        {headline}
      </Typography>
      <Typography
        variant="caption"
        translate="yes"
        sx={{ color: "text.secondary" }}
      >
        {confirmations != null
          ? "It will go through on its own once they confirm in Safe — you can close this tab."
          : "If you approved the request, the other owners can confirm it in Safe and this will go through on its own — you can close this tab. If you declined it, cancel below to release it."}
      </Typography>
      <SafeRelayPendingActions
        executionId={executionId}
        clientRequestId={clientRequestId}
        validBefore={validBefore}
        messageLink={messageLink}
      />
    </Stack>
  );
};
