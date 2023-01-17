import { Box, Stack, Typography, useTheme } from "@mui/material";
import { format } from "date-fns";
import { FC, memo, useMemo } from "react";

interface VestingScheduleProgressCheckpointProps {
  title: string;
  targetDate: Date;
  dateNow: Date;
}

const VestingScheduleProgressCheckpoint: FC<
  VestingScheduleProgressCheckpointProps
> = ({ title, targetDate, dateNow }) => {
  const theme = useTheme();
  const isActive = useMemo(() => targetDate <= dateNow, [targetDate, dateNow]);

  return (
    <Stack alignItems="center">
      <Stack sx={{ position: "relative", width: "100%", alignItems: "center" }}>
        <Box
          sx={{
            background: isActive
              ? theme.palette.primary.main
              : theme.palette.divider,
            width: "10px",
            height: "10px",
            borderRadius: "50%",
          }}
        />
      </Stack>
      <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
        {title}
      </Typography>
      <Typography variant="h6">
        {format(targetDate, "MMM do, yyyy HH:mm")}
      </Typography>
    </Stack>
  );
};

export default memo(VestingScheduleProgressCheckpoint);
