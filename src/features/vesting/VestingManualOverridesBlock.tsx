import {
  Box,
  Typography,
  Stack,
  Button,
  Divider,
  Collapse,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { FC, PropsWithChildren, useCallback, useMemo, useState } from "react";
import { Network } from "../network/networks";
import ExecuteVestingCliffAndFlowButton from "./ExecuteVestingCliffAndFlowButton";
import { VestingSchedule } from "./types";
import ExecuteEndVestingButton from "./ExecuteEndVestingButton";
import { fromUnixTime, getUnixTime } from "date-fns";

interface VestingManualActionProps extends PropsWithChildren {
  title: string;
  description: string;
}

const VestingManualAction: FC<VestingManualActionProps> = ({
  title,
  description,
  children,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        [theme.breakpoints.down("md")]: { maxWidth: "100%" },
        [theme.breakpoints.up("md")]: { maxWidth: "240px" },
      }}
    >
      <Typography variant="h6">{title}</Typography>
      <Typography sx={{ mt: 1, mb: 2 }}>{description}</Typography>
      {children}
    </Box>
  );
};

interface VestingManualOverridesBlockProps {
  vestingSchedule: VestingSchedule;
  network: Network;
}

const VestingManualOverridesBlock: FC<VestingManualOverridesBlockProps> = ({
  vestingSchedule,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [expanded, setExpanded] = useState(true);

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  console.log({ vestingSchedule });
  const {
    cliffAndFlowExecutedAt,
    cliffAndFlowExpirationAt,
    endExecutedAt,
    cliffAndFlowDate,
    endDateValidAt,
    endDate,
  } = vestingSchedule;

  const canExecuteCliff = useMemo(() => {
    const currentUnix = getUnixTime(Date.now());
    return (
      !cliffAndFlowExecutedAt &&
      currentUnix > cliffAndFlowDate &&
      currentUnix < cliffAndFlowExpirationAt
    );
  }, [cliffAndFlowExecutedAt, cliffAndFlowDate, cliffAndFlowExpirationAt]);

  const canExecuteEnd = useMemo(() => {
    const currentUnix = getUnixTime(Date.now());
    return (
      !endExecutedAt && currentUnix > endDateValidAt && currentUnix < endDate
    );
  }, [endExecutedAt, endDateValidAt, endDate]);

  console.log(fromUnixTime(endDateValidAt));
  return (
    <>
      <Stack direction="row" alignItems="center">
        <Typography
          variant="h6"
          color="text.secondary"
          onClick={toggleExpanded}
        >
          Show manual overrides
        </Typography>
      </Stack>

      <Collapse in={expanded}>
        <Stack
          direction={isBelowMd ? "column" : "row"}
          alignItems="stretch"
          gap={isBelowMd ? 3 : 2}
        >
          <VestingManualAction
            title="Send Cliff and Start Stream"
            description="Manually send the cliff amount and start vesting stream."
          >
            <ExecuteVestingCliffAndFlowButton
              vestingSchedule={vestingSchedule}
              network={network}
            />
          </VestingManualAction>

          {!isBelowMd && (
            <Divider
              orientation="vertical"
              sx={{
                width: "auto",
              }}
            />
          )}

          <VestingManualAction
            title="End Vesting"
            description="Manually execute vesting end to stop the stream."
          >
            <ExecuteEndVestingButton
              vestingSchedule={vestingSchedule}
              network={network}
            />
          </VestingManualAction>
        </Stack>
      </Collapse>
    </>
  );
};

export default VestingManualOverridesBlock;
