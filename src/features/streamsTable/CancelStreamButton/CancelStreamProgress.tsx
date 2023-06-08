import { Stack, CircularProgress, Typography } from "@mui/material";
import { FC } from "react";
import {
  PendingStreamCancellation,
  PendingCreateTaskDeletion,
} from "../../pendingUpdates/PendingStreamCancellation";

interface CancelStreamProgressProps {
  isSchedule?: boolean;
  pendingCancellation?: PendingStreamCancellation | PendingCreateTaskDeletion;
}

const CancelStreamProgress: FC<CancelStreamProgressProps> = ({
  isSchedule,
  pendingCancellation,
}) => {
  const removingScheduleFromStream =
    pendingCancellation &&
    pendingCancellation?.pendingType === "CreateTaskDelete" &&
    !isSchedule;

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      <CircularProgress color="warning" size="16px" />
      <Typography data-cy={"pending-message"} variant="caption" translate="yes">
        {pendingCancellation?.hasTransactionSucceeded ||
        removingScheduleFromStream ? (
          <span>Syncing...</span>
        ) : (
          <span>Canceling...</span>
        )}
      </Typography>
    </Stack>
  );
};

export default CancelStreamProgress;
