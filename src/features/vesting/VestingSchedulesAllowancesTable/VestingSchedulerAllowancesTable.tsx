import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { BigNumber } from "ethers";
import { groupBy, uniq } from "lodash";
import { FC } from "react";
import { vestingSubgraphApi } from "../../../vesting-subgraph/vestingSubgraphApi";
import TooltipIcon from "../../common/TooltipIcon";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { platformApi } from "../../redux/platformApi/platformApi";
import { rpcApi } from "../../redux/store";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import VestingSchedulerAllowanceRow from "./VestingSchedulerAllowanceRow";

const VestingSchedulerAllowancesTable: FC = () => {
  const { network } = useExpectedNetwork();
  const { visibleAddress: senderAddress } = useVisibleAddress();

  const { data: vestingSchedulerConstants } =
    rpcApi.useGetVestingSchedulerConstantsQuery({
      chainId: network.id,
    });

  // TODO(KK): This query could be optimized.
  const vestingSchedulesQuery = vestingSubgraphApi.useGetVestingSchedulesQuery(
    senderAddress
      ? {
          chainId: network.id,
          where: { sender: senderAddress?.toLowerCase() },
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        ...result,
        data: uniq(result.data?.vestingSchedules ?? []),
      }),
    }
  );

  const vestingSchedulesGroupedByToken = groupBy(
    vestingSchedulesQuery.data,
    (x) => x.superToken
  );

  if (!vestingSchedulerConstants) {
    return <>Loading...</>;
  }

  const tokenSummaries = Object.entries(vestingSchedulesGroupedByToken).map(
    (entry) => {
      const [tokenAddress, group] = entry;

      const recommendedTokenAllowance = group.reduce(
        (previousValue, vestingSchedule) => {
          const startDateValidAfterAllowance = BigNumber.from(
            vestingSchedule.flowRate
          ).mul(vestingSchedulerConstants.START_DATE_VALID_AFTER_IN_SECONDS);
          const endDateValidBeforeAllowance = BigNumber.from(
            vestingSchedule.flowRate
          ).mul(vestingSchedulerConstants.END_DATE_VALID_BEFORE_IN_SECONDS);

          if (vestingSchedule.cliffAndFlowExecutedAt) {
            return previousValue.add(endDateValidBeforeAllowance);
          } else {
            return previousValue
              .add(vestingSchedule.cliffAmount)
              .add(startDateValidAfterAllowance)
              .add(endDateValidBeforeAllowance);
          }
        },
        BigNumber.from("0")
      );

      const requiredFlowOperatorAllowance = group
        .filter((x) => !x.cliffAndFlowExecutedAt)
        .reduce(
          (previousValue, vestingSchedule) =>
            previousValue.add(vestingSchedule.flowRate),
          BigNumber.from("0")
        );

      return {
        tokenAddress,
        recommendedTokenAllowance,
        requiredFlowOperatorPermissions: 5, // Create not needed after cliffAndFlows are executed
        requiredFlowOperatorAllowance,
      };
    }
  );

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Token</TableCell>
            <TableCell width="220px">
              Token Allowance
              <TooltipIcon
                IconProps={{ sx: { ml: 0.5 } }}
                title="The token allowance needed by the contract for cliff & compensation transfers."
              />
            </TableCell>
            <TableCell width="260px">
              Flow Operator Permissions
              <TooltipIcon
                IconProps={{ sx: { ml: 0.5 } }}
                title="The flow operator permissions needed by the contract for creating & deletion of Superfluid flows."
              />
            </TableCell>
            <TableCell width="250px">
              Flow Operator Allowance
              <TooltipIcon
                IconProps={{ sx: { ml: 0.5 } }}
                title="The flow operator allowance needed by the contract for creating Superfluid flows."
              />
            </TableCell>
            <TableCell width="60px" />
          </TableRow>
        </TableHead>
        <TableBody>
          {senderAddress &&
            tokenSummaries.map(
              (
                {
                  tokenAddress,
                  recommendedTokenAllowance,
                  requiredFlowOperatorPermissions,
                  requiredFlowOperatorAllowance,
                },
                index
              ) => (
                <VestingSchedulerAllowanceRow
                  key={tokenAddress}
                  isLast={index === tokenSummaries.length - 1}
                  network={network}
                  tokenAddress={tokenAddress}
                  senderAddress={senderAddress}
                  recommendedTokenAllowance={recommendedTokenAllowance}
                  requiredFlowOperatorPermissions={
                    requiredFlowOperatorPermissions
                  }
                  requiredFlowOperatorAllowance={requiredFlowOperatorAllowance}
                />
              )
            )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VestingSchedulerAllowancesTable;
