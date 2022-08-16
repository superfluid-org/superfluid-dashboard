import { Stack, CircularProgress, Typography } from "@mui/material";
import { FC } from "react";
import { PendingStreamCancellation } from "../../pendingUpdates/PendingStreamCancellation";

interface CancelStreamProgressProps {
  pendingCancellation?: PendingStreamCancellation;
}

const CancelStreamProgress: FC<CancelStreamProgressProps> = ({
  pendingCancellation,
}) => (
  <Stack direction="row" alignItems="center" gap={1}>
    <CircularProgress color="warning" size="16px" />
    <Typography variant="caption" translate="yes">
      {pendingCancellation?.hasTransactionSucceeded ? (
        <span>Syncing...</span>
      ) : (
        <span>Canceling...</span>
      )}
    </Typography>
  </Stack>
);

export default CancelStreamProgress;
