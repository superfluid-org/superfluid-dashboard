import {
  Box,
  Collapse,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { getUnixTime } from "date-fns";
import { FC, PropsWithChildren, useCallback, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Network } from "../network/networks";
import { rpcApi } from "../redux/store";
import ExecuteEndVestingButton from "./ExecuteEndVestingButton";
import ExecuteVestingCliffAndFlowButton from "./ExecuteVestingCliffAndFlowButton";
import { VestingSchedule } from "./types";

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
  const {
    cliffAndFlowExecutedAt,
    endExecutedAt,
    cliffAndFlowDate,
    endDate,
    superToken,
    sender,
    receiver,
  } = vestingSchedule;

  const { address: accountAddress } = useAccount();
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [expanded, setExpanded] = useState(true);

  const shouldFetchActiveFlow =
    accountAddress && accountAddress.toLowerCase() === sender.toLowerCase();

  const { currentData: activeFlow } = rpcApi.useGetActiveFlowQuery(
    shouldFetchActiveFlow
      ? {
          chainId: network.id,
          tokenAddress: superToken,
          senderAddress: sender,
          receiverAddress: receiver,
        }
      : skipToken
  );

  const { data: vestingSchedulerConstants } =
    rpcApi.useGetVestingSchedulerConstantsQuery({
      chainId: network.id,
    });

  const toggleExpanded = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded, setExpanded]);

  const hasActiveFlow = !!activeFlow;

  const canExecuteCliff = useMemo(() => {
    if (!vestingSchedulerConstants) return false;

    const currentUnix = getUnixTime(Date.now());
    const startDateInvalidAfter =
      cliffAndFlowDate +
      vestingSchedulerConstants.START_DATE_VALID_AFTER_IN_SECONDS;

    return (
      !hasActiveFlow &&
      !cliffAndFlowExecutedAt &&
      currentUnix > cliffAndFlowDate &&
      currentUnix < startDateInvalidAfter
    );
  }, [
    cliffAndFlowExecutedAt,
    cliffAndFlowDate,
    vestingSchedulerConstants,
    hasActiveFlow,
  ]);

  const canExecuteEnd = useMemo(() => {
    if (!vestingSchedulerConstants) return false;

    const currentUnix = getUnixTime(Date.now());
    const endDateInvalidBefore =
      endDate - vestingSchedulerConstants.END_DATE_VALID_BEFORE_IN_SECONDS;

    return (
      !endExecutedAt &&
      currentUnix > endDateInvalidBefore &&
      currentUnix < endDate
    );
  }, [endExecutedAt, endDate, vestingSchedulerConstants]);

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
              disabled={!canExecuteCliff}
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
              disabled={!canExecuteEnd}
            />
          </VestingManualAction>
        </Stack>
      </Collapse>
    </>
  );
};

export default VestingManualOverridesBlock;
