import { Box, Stack, Typography, useTheme } from "@mui/material";
import { format } from "date-fns";
import { FC, memo, useMemo } from "react";

interface VestingScheduleProgressCheckpointProps {
  titles: string[];
  targetDate: Date;
  dateNow: Date;
  dataCy?: string;
}

const VestingScheduleProgressCheckpoint: FC<
  VestingScheduleProgressCheckpointProps
> = ({ titles, targetDate, dateNow, dataCy }) => {
  const theme = useTheme();
  const isActive = useMemo(() => targetDate <= dateNow, [targetDate, dateNow]);

  return (
    <Stack data-cy={dataCy} alignItems="center">
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
      <Stack sx={{ mt: 1 }} alignItems="center">
        {titles.map((title) => (
          <Typography
            key={title}
            data-cy={`${dataCy}-title`}
            variant="h6"
            color="text.secondary"
          >
            {title}
          </Typography>
        ))}
      </Stack>

      <Typography data-cy={`${dataCy}-date`} variant="h6">
        {format(targetDate, "MMM do, yyyy HH:mm")}
      </Typography>
    </Stack>
  );
};

export default memo(VestingScheduleProgressCheckpoint);
