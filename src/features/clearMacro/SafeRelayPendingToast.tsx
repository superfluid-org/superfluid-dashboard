import { FC, useState } from "react";
import { Button, Link, Stack, Tooltip, Typography } from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useCancelRelayExecution } from "./useCancelRelayExecution";

/**
 * The persistent surface for a Safe gasless request that is waiting on its owners.
 *
 * Replaces the plain "still being confirmed, please don't retry" string for Safe entries. That
 * copy is wrong on both halves for a multi-day co-signer wait: nothing is being confirmed yet,
 * and the reason not to retry is not vagueness but a concrete double-spend the user can resolve
 * by cancelling.
 *
 * Everything the user needs to act without this tab survives is here: the expiry, the execution
 * id (which is the ONLY handle on a live intent — there is no lookup by signer), a link to the
 * message in Safe, and Cancel.
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

const formatExpiry = (validBefore: number) =>
  new Date(validBefore * 1000).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

export const SafeRelayPendingToast: FC<SafeRelayPendingToastProps> = ({
  executionId,
  clientRequestId,
  validBefore,
  messageLink,
  confirmations,
  threshold,
}) => {
  const cancel = useCancelRelayExecution();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [copied, setCopied] = useState(false);

  // Confident copy only when the Transaction Service actually told us a proposal exists.
  // Otherwise the honest version: we cannot distinguish "signed and closed the modal" from
  // "declined", and the user can.
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
      <Typography variant="caption" translate="yes" sx={{ color: "text.secondary" }}>
        {confirmations != null
          ? "It will go through on its own once they confirm in Safe — you can close this tab."
          : "If you approved the request, the other owners can confirm it in Safe and this will go through on its own — you can close this tab. If you declined it, cancel below to release it."}
      </Typography>
      <Typography variant="caption" translate="yes" sx={{ color: "text.secondary" }}>
        Open until {formatExpiry(validBefore)}.
      </Typography>

      <Stack
        direction="row"
        sx={{ alignItems: "center", gap: 0.5, flexWrap: "wrap" }}
      >
        <Typography variant="caption" sx={{ color: "text.secondary" }} translate="no">
          {executionId}
        </Typography>
        <Tooltip title={copied ? "Copied" : "Copy execution ID"}>
          <Button
            size="small"
            data-cy="safe-relay-copy-execution-id"
            aria-label="Copy execution ID"
            sx={{ minWidth: 0, p: 0.5 }}
            onClick={() => {
              void navigator.clipboard?.writeText(executionId).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              });
            }}
          >
            <ContentCopyRoundedIcon fontSize="inherit" />
          </Button>
        </Tooltip>
      </Stack>

      <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap" }}>
        {messageLink && (
          <Link
            href={messageLink}
            target="_blank"
            rel="noopener noreferrer"
            variant="caption"
            data-cy="safe-relay-review-in-safe"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.25 }}
          >
            Review in Safe
            <OpenInNewRoundedIcon fontSize="inherit" />
          </Link>
        )}
        {!isConfirmingCancel ? (
          <Button
            size="small"
            color="error"
            data-cy="safe-relay-cancel"
            onClick={() => setIsConfirmingCancel(true)}
          >
            Cancel
          </Button>
        ) : (
          <Stack sx={{ gap: 0.5 }}>
            <Typography variant="caption" translate="yes">
              Cancel this gasless request? This can&apos;t be undone.
            </Typography>
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button
                size="small"
                color="error"
                variant="contained"
                data-cy="safe-relay-cancel-confirm"
                disabled={cancel.isPending}
                onClick={() =>
                  cancel.mutate({ executionId, clientRequestId })
                }
              >
                {cancel.isPending ? "Cancelling…" : "Yes, cancel"}
              </Button>
              <Button
                size="small"
                data-cy="safe-relay-cancel-dismiss"
                disabled={cancel.isPending}
                onClick={() => setIsConfirmingCancel(false)}
              >
                Keep it
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>

      {cancel.isError && (
        <Typography
          variant="caption"
          color="error"
          translate="yes"
          data-cy="safe-relay-cancel-error"
        >
          {cancel.error instanceof Error
            ? cancel.error.message
            : "The cancellation could not be confirmed."}
        </Typography>
      )}
    </Stack>
  );
};
