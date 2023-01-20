import { Box, Paper, Stack, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { Address } from "@superfluid-finance/sdk-core";
import { BigNumber } from "ethers";
import groupBy from "lodash/fp/groupBy";
import { FC, useEffect, useMemo, useState } from "react";
import { VestingActivities } from "../../pages/vesting/[_network]/[_id]";
import { mapActivitiesFromEvents } from "../../utils/activityUtils";
import { TokenBalance } from "../../utils/chartUtils";
import {
  calculateVestingSchedulesAllocated,
  mapVestingActivitiesToTokenBalances,
} from "../../utils/vestingUtils";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import { VestingSchedule } from "./types";
import { useVestingToken } from "./useVestingToken";
import { VestingDataCardContent } from "./VestingDataCard";

interface VestingTokenAggregationRowProps {
  tokenAddress: Address;
  vestingSchedules: VestingSchedule[];
  network: Network;
}

const VestingTokenAggregationRow: FC<VestingTokenAggregationRowProps> = ({
  tokenAddress,
  vestingSchedules,
  network,
}) => {
  const tokenQuery = useVestingToken(network, tokenAddress);
  const token = tokenQuery.data;
  const tokenPrice = useTokenPrice(network.id, token?.underlyingAddress);

  //   const [vestingScheduleActivities, setVestingScheduleActivities] = useState();

  //   const [eventsQueryTrigger] = subgraphApi.useLazyEventsQuery();

  //   useEffect(() => {
  //     Promise.all(
  //       vestingSchedules.map((vestingSchedule) =>
  //         eventsQueryTrigger(
  //           {
  //             chainId: network.id,
  //             filter: {
  //               name_in: ["FlowUpdated", "Transfer"],
  //               addresses_contains_nocase: [
  //                 vestingSchedule.superToken,
  //                 vestingSchedule.sender,
  //                 vestingSchedule.receiver,
  //               ],
  //               timestamp_gte:
  //                 vestingSchedule.cliffAndFlowExecutedAt ||
  //                 vestingSchedule.startDate,
  //               timestamp_lte:
  //                 vestingSchedule.endExecutedAt || vestingSchedule.endDate,
  //             },
  //             order: {
  //               orderBy: "order",
  //               orderDirection: "desc",
  //             },
  //           },
  //           true
  //         ).then((result) =>
  //           mapVestingActivitiesToTokenBalances(
  //             mapActivitiesFromEvents(
  //               result.data?.items || [],
  //               network
  //             ) as VestingActivities,
  //             vestingSchedule
  //           ).pop()
  //         )
  //       )
  //     ).then((responses: (TokenBalance | undefined)[]) => {
  //       console.log({ responses });
  //     });
  //   }, [vestingSchedules, network, eventsQueryTrigger]);

  const allocated = useMemo(
    () => calculateVestingSchedulesAllocated(vestingSchedules).toString(),
    [vestingSchedules]
  );

  //   TODO:
  //   const currentlyVested = useMemo(() => {
  //     mapVestingActivitiesToTokenBalances();

  //     return "0";
  //   }, []);

  return (
    <>
      <Divider />
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr" }}>
        <Box sx={{ px: 4, py: 2.5 }}>
          <VestingDataCardContent
            title="Total Tokens Allocated"
            tokenSymbol={token?.symbol || ""}
            amount={allocated}
            price={tokenPrice}
          />
        </Box>
        <Divider orientation="vertical" />
        <Box sx={{ px: 4, py: 2.5 }}>
          <VestingDataCardContent
            title="Cliff Not Amount"
            tokenSymbol={""}
            amount={""}
            price={0}
          />
        </Box>
      </Box>
    </>
  );
};

interface AggregatedVestingSchedulesProps {
  vestingSchedules: VestingSchedule[];
  network: Network;
}

const AggregatedVestingSchedules: FC<AggregatedVestingSchedulesProps> = ({
  vestingSchedules,
  network,
}) => {
  const vestingSchedulesByTokenAddress = useMemo(
    () => groupBy((schedule) => schedule.superToken, vestingSchedules),
    [vestingSchedules]
  );

  return (
    <Paper component={Stack} sx={{ flex: 1 }}>
      <Stack direction="row" alignItems="center" gap={2} sx={{ py: 3, px: 4 }}>
        <NetworkIcon network={network} />
        <Typography
          data-cy="network-name"
          variant="h5"
          color="text.primary"
          translate="no"
        >
          {network.name}
        </Typography>
      </Stack>
      {Object.entries(vestingSchedulesByTokenAddress).map(
        ([token, vestingSchedules]) => (
          <VestingTokenAggregationRow
            key={token}
            network={network}
            tokenAddress={token}
            vestingSchedules={vestingSchedules}
          />
        )
      )}
    </Paper>
  );
};

export default AggregatedVestingSchedules;
