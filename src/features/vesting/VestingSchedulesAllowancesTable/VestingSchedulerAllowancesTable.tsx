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
import { FC, useMemo } from "react";
import NoContentPaper from "../../../components/NoContent/NoContentPaper";
import { vestingSubgraphApi } from "../../../vesting-subgraph/vestingSubgraphApi";
import TooltipIcon from "../../common/TooltipIcon";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { rpcApi } from "../../redux/store";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import { calculateRequiredAccessForActiveVestingSchedule } from "./calculateRequiredAccessForActiveVestingSchedule";
import VestingSchedulerAllowanceRow, {
  VestingSchedulerAllowanceRowSkeleton,
} from "./VestingSchedulerAllowanceRow";

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

  const tokenSummaries = useMemo(() => {
    if (!vestingSchedulerConstants || !vestingSchedulesQuery.data) return [];

    const vestingSchedulesGroupedByToken = groupBy(
      vestingSchedulesQuery.data,
      (x) => x.superToken
    );

    return Object.entries(vestingSchedulesGroupedByToken).map((entry) => {
      const [tokenAddress, allGroupVestingSchedules] = entry;
      const activeVestingSchedules = allGroupVestingSchedules.filter(
        (x) => !x.status.isFinished
      );

      const aggregatedRequiredAccess = activeVestingSchedules
        .map((vs) =>
          calculateRequiredAccessForActiveVestingSchedule(
            vs,
            vestingSchedulerConstants
          )
        )
        .reduce(
          (previousValue, currentValue) => ({
            ...previousValue,
            recommendedTokenAllowance:
              previousValue.recommendedTokenAllowance.add(
                currentValue.recommendedTokenAllowance
              ),
            requiredFlowRateAllowance:
              previousValue.requiredFlowRateAllowance.add(
                currentValue.requiredFlowRateAllowance
              ),
            requiredFlowOperatorPermissions:
              previousValue.requiredFlowOperatorPermissions |
              currentValue.requiredFlowOperatorPermissions,
          }),
          {
            recommendedTokenAllowance: BigNumber.from("0"),
            requiredFlowRateAllowance: BigNumber.from("0"),
            requiredFlowOperatorPermissions: 0,
          }
        );

      return {
        tokenAddress,
        ...aggregatedRequiredAccess,
      };
    });
  }, [vestingSchedulesQuery.data, vestingSchedulerConstants]);

  const isLoading =
    !vestingSchedulerConstants || vestingSchedulesQuery.isLoading;

  if ((!isLoading && tokenSummaries.length === 0) || !senderAddress) {
    return (
      <NoContentPaper
        title="No Access Data"
        description="Permissions and allowances that you have given will appear here."
      />
    );
  }

  return (
    <ConnectionBoundary>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Token</TableCell>
              <TableCell>Auto Wrap</TableCell>
              <TableCell data-cy="allowance-cell" width="220px">
                Token Allowance
                <TooltipIcon
                  IconProps={{ sx: { ml: 0.5 } }}
                  title="The token allowance needed by the contract for cliff & compensation transfers."
                />
              </TableCell>
              <TableCell data-cy="operator-permissions-cell" width="260px">
                Stream Permissions
                <TooltipIcon
                  IconProps={{ sx: { ml: 0.5 } }}
                  title="The stream permissions needed by the contract for creating & deletion of Superfluid flows."
                />
              </TableCell>
              <TableCell data-cy="flow-allowance-cell" width="250px">
                Stream Allowance
                <TooltipIcon
                  IconProps={{ sx: { ml: 0.5 } }}
                  title="The stream flow rate allowance needed by the contract for creating Superfluid flows."
                />
              </TableCell>
              <TableCell width="60px" />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <>
                <VestingSchedulerAllowanceRowSkeleton />
                <VestingSchedulerAllowanceRowSkeleton />
              </>
            ) : (
              tokenSummaries.map(
                (
                  {
                    tokenAddress,
                    recommendedTokenAllowance,
                    requiredFlowOperatorPermissions,
                    requiredFlowRateAllowance,
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
                    requiredFlowRateAllowance={
                      requiredFlowRateAllowance
                    }
                  />
                )
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </ConnectionBoundary>
  );
};

export default VestingSchedulerAllowancesTable;
