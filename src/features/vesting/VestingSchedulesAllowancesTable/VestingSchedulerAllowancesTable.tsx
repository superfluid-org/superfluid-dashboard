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
import { ACL_CREATE_PERMISSION, ACL_DELETE_PERMISSION } from "../../redux/endpoints/flowSchedulerEndpoints";
import { rpcApi } from "../../redux/store";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
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

      const recommendedTokenAllowance = activeVestingSchedules.reduce(
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

      const requiredFlowOperatorAllowance = activeVestingSchedules
        .filter((x) => !x.cliffAndFlowExecutedAt)
        .reduce(
          (previousValue, vestingSchedule) =>
            previousValue.add(vestingSchedule.flowRate),
          BigNumber.from("0")
        );

      // https://docs.superfluid.finance/superfluid/developers/constant-flow-agreement-cfa/cfa-access-control-list-acl/acl-features
      const requiredFlowOperatorPermissions =
        activeVestingSchedules.length === 0
          ? 0 // None
          : activeVestingSchedules.some((x) => !x.cliffAndFlowExecutedAt) // Create not needed after cliffAndFlows are executed
          ? ACL_CREATE_PERMISSION | ACL_DELETE_PERMISSION
          : ACL_DELETE_PERMISSION;

      return {
        tokenAddress,
        recommendedTokenAllowance,
        requiredFlowOperatorPermissions,
        requiredFlowOperatorAllowance,
      };
    });
  }, [vestingSchedulesQuery.data, vestingSchedulerConstants]);

  const isLoading =
    !vestingSchedulerConstants || vestingSchedulesQuery.isLoading;

  if ((!isLoading && tokenSummaries.length === 0) || !senderAddress) {
    return (
      <NoContentPaper
        title="No Allowances Data"
        description="Allowances and permissions that you have given will appear here."
      />
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }}>
        <TableHead>
          <TableRow>
            <TableCell>Token</TableCell>
            <TableCell data-cy="allowance-cell" width="220px">
              Token Allowance
              <TooltipIcon
                IconProps={{ sx: { ml: 0.5 } }}
                title="The token allowance needed by the contract for cliff & compensation transfers."
              />
            </TableCell>
            <TableCell data-cy="operator-permissions-cell" width="260px">
              Flow Operator Permissions
              <TooltipIcon
                IconProps={{ sx: { ml: 0.5 } }}
                title="The flow operator permissions needed by the contract for creating & deletion of Superfluid flows."
              />
            </TableCell>
            <TableCell data-cy="flow-allowance-cell" width="250px">
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
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VestingSchedulerAllowancesTable;
