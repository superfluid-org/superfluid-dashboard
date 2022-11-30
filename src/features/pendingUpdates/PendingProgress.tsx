import { CircularProgress, Stack, Typography } from "@mui/material";
import { FC } from "react";
import { PendingUpdate } from "./PendingUpdate";

// TODO(KK): Consider making this re-used with stream cancellation?
export const PendingProgress: FC<{
  pendingUpdate: PendingUpdate | undefined;
  transactingText: string;
}> = ({ pendingUpdate, transactingText }) => (
  <Stack direction="row" alignItems="center" gap={1}>
    <CircularProgress color="warning" size="16px" />
    <Typography data-cy={"pending-message"} variant="caption" translate="yes">
      {pendingUpdate?.hasTransactionSucceeded ? (
        <span>Syncing...</span>
      ) : (
        <span>{transactingText}</span>
      )}
    </Typography>
  </Stack>
);
