import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { BigNumber } from "ethers";
import { groupBy, uniq } from "lodash";
import { FC, useMemo } from "react";
import NoContentPaper from "../../../components/NoContent/NoContentPaper";
import { vestingSubgraphApi } from "../../../vesting-subgraph/vestingSubgraphApi";
import TooltipWithIcon from "../../common/TooltipWithIcon";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { rpcApi } from "../../redux/store";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import { calculateRequiredAccessForActiveVestingSchedule } from "./calculateRequiredAccessForActiveVestingSchedule";
import VestingSchedulerAllowanceRow, {
  VestingSchedulerAllowanceRowSkeleton,
} from "./VestingSchedulerAllowanceRow";
import { VestingTooltips } from "../CreateVestingForm";
import { useVestingVersion } from "../../../hooks/useVestingVersion";
import { EMPTY_ARRAY } from "../../../utils/constants";
import { ContractVersion } from "../../../vesting-subgraph/.graphclient";

const VestingSchedulerAllowancesTable: FC = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { network } = useExpectedNetwork();
  const { visibleAddress: senderAddress } = useVisibleAddress();

  const { vestingVersion } = useVestingVersion();

  const { data: vestingSchedulerConstants } =
    rpcApi.useGetVestingSchedulerConstantsQuery({
      chainId: network.id,
      version: vestingVersion
    });

  // TODO(KK): This query could be optimized.
  const vestingSchedulesQuery = vestingSubgraphApi.useGetVestingSchedulesQuery(
    senderAddress
      ? {
        chainId: network.id,
        where: { sender: senderAddress?.toLowerCase(), contractVersion: vestingVersion as ContractVersion },
      }
      : skipToken,
    {
      selectFromResult: (result) => ({
        ...result,
        data: result.data?.vestingSchedules ?? EMPTY_ARRAY,
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
      <TableContainer
        component={Paper}
        sx={{
          [theme.breakpoints.down("md")]: {
            mx: -2,
            width: "auto",
            borderRadius: 0,
            border: "none",
            borderBottom: `1px solid ${theme.palette.divider}`,
            boxShadow: "none",
          },
        }}
      >
        <Table
          sx={{
            [theme.breakpoints.down("md")]: {
              tableLayout: "fixed",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell width={"180px"}>Token</TableCell>
              {!isBelowMd && (
                <>
                  <TableCell data-cy="allowance-cell" width="200px">
                    Token Allowance
                    <TooltipWithIcon
                      IconProps={{ sx: { ml: 0.5 } }}
                      title="The token allowance needed by the contract for cliff & compensation transfers."
                    />
                  </TableCell>
                  <TableCell data-cy="operator-permissions-cell" width="220px">
                    Stream Permissions
                    <TooltipWithIcon
                      IconProps={{ sx: { ml: 0.5 } }}
                      title="The stream permissions needed by the contract for creating & deletion of Superfluid flows."
                    />
                  </TableCell>
                  <TableCell
                    data-cy="flow-allowance-cell"
                    width={network.autoWrap ? "220px" : "280px"}
                  >
                    Stream Allowance
                    <TooltipWithIcon
                      IconProps={{ sx: { ml: 0.5 } }}
                      title="The stream flow rate allowance needed by the contract for creating Superfluid flows."
                    />
                  </TableCell>
                  {network.autoWrap && (
                    <TableCell width="160px">
                      Auto-Wrap
                      <TooltipWithIcon
                        IconProps={{ sx: { ml: 0.5 } }}
                        title={VestingTooltips.AutoWrap}
                      />
                    </TableCell>
                  )}
                </>
              )}

              <TableCell width={isBelowMd ? "68px" : "100px"} />
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
                    requiredFlowRateAllowance={requiredFlowRateAllowance}
                    vestingVersion={vestingVersion}
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
