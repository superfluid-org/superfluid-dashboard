import {
  useTheme,
  useMediaQuery,
  Paper,
  Typography,
  Stack,
} from "@mui/material";
import AutoWrapAddTokenButtonSection from "./AutoWrapAddTokenButtonSection";
import { PlatformWhitelistedStatuses } from "./ScheduledWrapTables";
import { FC } from "react";

const ScheduledWrapEmptyCard: FC<{
  platformWhitelistedStatuses: PlatformWhitelistedStatuses;
}> = ({ platformWhitelistedStatuses }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Stack
      gap={1}
      component={Paper}
      alignItems={"center"}
      sx={{
        px: 4,
        py: 7,
        [theme.breakpoints.down("md")]: {
          px: 2,
          py: 3,
        },
      }}
    >
      <Typography
        data-cy={`title`}
        variant={isBelowMd ? "h5" : "h4"}
        textAlign="center"
      >
        Nothing to see here
      </Typography>
      <Typography
        data-cy={`description`}
        color="text.secondary"
        textAlign="center"
      >
        Add your first Auto-Wrap configuration
      </Typography>
      <AutoWrapAddTokenButtonSection
        platformWhitelistedStatuses={platformWhitelistedStatuses}
      />
    </Stack>
  );
};

export default ScheduledWrapEmptyCard;
