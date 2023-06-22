import {
  Box,
  Card,
  Stack,
  Typography,
} from "@mui/material";
import AutoWrapAddTokenButtonSection from "./AutoWrapAddTokenButtonSection";
import { PlatformWhitelistedStatuses } from "./ScheduledWrapTables";
import { FC } from "react";

const ScheduledWrapEmptyCard: FC<{
  platformWhitelistedStatuses: PlatformWhitelistedStatuses;
}> = ({ platformWhitelistedStatuses }) => (
  <Card
    sx={{ py: 5, textAlign: "center" }}
    component={Stack}
    gap={3}
    alignItems="center"
  >
    <Box>
      <Typography data-cy={"no-scheduled-wrap-message"} variant="h5">
        Nothing to see here
      </Typography>
      <Typography>Add your first Auto-Wrap configuration</Typography>
    </Box>
    <AutoWrapAddTokenButtonSection
      platformWhitelistedStatuses={platformWhitelistedStatuses}
    />
  </Card>
);

export default ScheduledWrapEmptyCard;
