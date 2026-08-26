import { FC, useState } from "react";
import { Button, Link, Stack, Tooltip, Typography } from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { useCancelRelayExecution } from "./useCancelRelayExecution";

/**
 * Execution id, Review in Safe, and Cancel for a Safe gasless request that is still open.
 *
 * Shared by the transaction dialog and the pending toast rather than duplicated, because these
 * three things have to be available wherever the user meets the request. The id in particular
 * is the ONLY handle on a live intent — the provider offers no lookup by signer — so a user
 * who clears storage or moves device can neither cancel it nor safely write that action
 * directly until it expires. Making it keepable costs nothing and is correct regardless of
 * whether the provider scopes cancellation to the creating client, which is unestablished.
 */
export interface SafeRelayPendingActionsProps {
  executionId: string;
  clientRequestId?: string;
  /** Unix seconds. */
  validBefore: number;
  /** Provider-returned and URL-validated; absent means no button, never a constructed URL. */
  messageLink?: string;
}

export const SafeRelayPendingActions: FC<SafeRelayPendingActionsProps> = ({
  executionId,
  clientRequestId,
  validBefore,
  messageLink,
}) => {
  const cancel = useCancelRelayExecution();
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  return (
    <Stack sx={{ gap: 1, alignItems: "center" }}>
      <Typography
        variant="caption"
        translate="yes"
        sx={{ color: "text.secondary" }}
      >
        Open until{" "}
        {new Date(validBefore * 1000).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
        .
      </Typography>

      <Stack
        direction="row"
        sx={{ alignItems: "center", gap: 0.5, flexWrap: "wrap" }}
      >
        <Typography
          data-cy="safe-relay-execution-id"
          variant="caption"
          translate="no"
          sx={{ color: "text.secondary", wordBreak: "break-all" }}
        >
          {executionId}
        </Typography>
        <Tooltip
          title={
            copyFailed
              ? "Couldn't copy — select the ID and copy it manually"
              : copied
                ? "Copied"
                : "Copy execution ID"
          }
        >
          <Button
            size="small"
            data-cy="safe-relay-copy-execution-id"
            aria-label="Copy execution ID"
            sx={{ minWidth: 0, p: 0.5 }}
            onClick={() => {
              // Clipboard access can be denied outright; a rejected promise here must not
              // become an unhandled rejection just because a copy button was pressed.
              navigator.clipboard
                ?.writeText(executionId)
                .then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                })
                .catch(() => setCopyFailed(true));
            }}
          >
            <ContentCopyRoundedIcon fontSize="inherit" />
          </Button>
        </Tooltip>
      </Stack>

      <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", alignItems: "center" }}>
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
                  cancel.mutate({ executionId, clientRequestId, messageLink })
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
