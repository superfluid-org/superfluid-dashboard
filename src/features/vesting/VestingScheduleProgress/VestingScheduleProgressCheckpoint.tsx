import { Box, Stack, Typography, useTheme } from "@mui/material";
import { format } from "date-fns";
import { FC, memo, useMemo } from "react";

interface VestingScheduleProgressCheckpointProps {
  titles: string[];
  targetDate: Date;
  measureDate: Date;
  nth: number;
  dataCy?: string;
}

const VestingScheduleProgressCheckpoint: FC<
  VestingScheduleProgressCheckpointProps
> = ({ titles, targetDate, measureDate, nth, dataCy }) => {
  const theme = useTheme();
  const isActive = useMemo(() => targetDate <= measureDate, [targetDate, measureDate]);

  return (
    <Stack
      data-cy={dataCy}
      sx={{
        [theme.breakpoints.up("md")]: {
          gridColumn: `${nth}/${nth + 1}`,
          gridRow: "1/2",
        },
        [theme.breakpoints.down("md")]: {
          gridRow: `${nth}/${nth + 1}`,
          gridColumn: "1/2",
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
        },
      }}
    >
      <Stack
        sx={{
          position: "relative",
          [theme.breakpoints.up("md")]: {
            width: "100%",
            alignItems: "center",
          },
        }}
      >
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
      <Stack
        sx={{
          [theme.breakpoints.up("md")]: {
            mt: 1,
            alignItems: "center",
          },
        }}
      >
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
        <Typography data-cy={`${dataCy}-date`} variant="h6">
          {format(targetDate, "MMM do, yyyy HH:mm")}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default memo(VestingScheduleProgressCheckpoint);
