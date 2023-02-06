import { Box, Paper, Stack, Typography } from "@mui/material";
import Divider from "@mui/material/Divider";
import { Address } from "@superfluid-finance/sdk-core";
import groupBy from "lodash/fp/groupBy";
import { FC, useMemo } from "react";
import { TokenBalance } from "../../utils/chartUtils";
import {
  aggregateTokenBalances,
  calculateVestingSchedulesAllocated,
  vestingScheduleToTokenBalance,
} from "../../utils/vestingUtils";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import Amount from "../token/Amount";
import FlowingBalance from "../token/FlowingBalance";
import FiatAmount from "../tokenPrice/FiatAmount";
import FlowingFiatBalance from "../tokenPrice/FlowingFiatBalance";
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
  const tokenPrice = useTokenPrice(network.id, tokenAddress);
  const token = tokenQuery.data;

  const allocated = useMemo(
    () => calculateVestingSchedulesAllocated(vestingSchedules).toString(),
    [vestingSchedules]
  );

  const aggregatedTokenBalance = useMemo(
    () =>
      aggregateTokenBalances(
        vestingSchedules.reduce((allSchedules, vestingSchedule) => {
          const tokenBalance = vestingScheduleToTokenBalance(vestingSchedule);

          if (!tokenBalance) return allSchedules;
          return [...allSchedules, tokenBalance];
        }, [] as TokenBalance[])
      ),
    [vestingSchedules]
  );

  return (
    <>
      <Divider />
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto 1fr" }}>
        <Box sx={{ px: 4, py: 2.5 }}>
          <VestingDataCardContent
            title="Total Tokens Allocated"
            tokenSymbol={token?.symbol || ""}
            tokenAmount={<Amount wei={allocated} />}
            fiatAmount={
              tokenPrice && <FiatAmount wei={allocated} price={tokenPrice} />
            }
            dataCy={`${token?.symbol}-total-allocated`}
          />
        </Box>
        <Divider orientation="vertical" />
        <Box sx={{ px: 4, py: 2.5 }}>
          <VestingDataCardContent
            title="Total Vested"
            tokenSymbol={token?.symbol || ""}
            tokenAmount={
              <FlowingBalance
                balance={aggregatedTokenBalance.balance}
                flowRate={aggregatedTokenBalance.totalNetFlowRate}
                balanceTimestamp={aggregatedTokenBalance.timestamp}
              />
            }
            dataCy={`${token?.symbol}-total-vested`}
            fiatAmount={
                tokenPrice && (
                    <FlowingFiatBalance
                        balance={aggregatedTokenBalance.balance}
                        flowRate={aggregatedTokenBalance.totalNetFlowRate}
                        balanceTimestamp={aggregatedTokenBalance.timestamp}
                        price={tokenPrice}
                    />
                )
            }
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
