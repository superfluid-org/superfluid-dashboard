import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { BigNumber } from "ethers";
import { groupBy, uniq } from "lodash";
import { FC } from "react";
import { useGetVestingSchedulesQuery } from "../../vesting-subgraph/getVestingSchedules.generated";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { Network } from "../network/networks";
import { rpcApi, subgraphApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DangerousRoundedIcon from "@mui/icons-material/DangerousRounded";
import TokenIcon from "../token/TokenIcon";
import Amount from "../token/Amount";
import { flowOperatorPermissionsToString } from "../../utils/flowOperatorPermissionsToString";
import Link from "../common/Link";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";

export const VestingSchedulerAllowances: FC = () => {
  const { network } = useExpectedNetwork();
  const { visibleAddress: senderAddress } = useVisibleAddress();

  const { data: vestingSchedulerConstants } =
    rpcApi.useGetVestingSchedulerConstantsQuery({
      chainId: network.id,
    });

  const vestingSchedulesQuery = useGetVestingSchedulesQuery(
    senderAddress
      ? {
          where: { sender: senderAddress?.toLowerCase(), deletedAt: null }, // TODO(KK): Should show allowance for tokens with finished vesting?
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

  const contractAddressLink = network.getLinkForAddress(
    network.flowSchedulerContractAddress!
  );

  return (
    <>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreRoundedIcon />}
          aria-controls="allowances-and-permissions-content"
          id="allowances-and-permissions-header"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {/* <CheckCircleRoundedIcon sx={{ color: "primary.main" }} /> */}
            <Typography variant="h6">
              Smart Contract, Allowances and Permissions{" "}
              <Typography variant="caption">(Advanced)</Typography>
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
            <Link href={contractAddressLink}>
              View Contract on Blockchain Explorer
            </Link>
            <LaunchRoundedIcon />
          </Stack>
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Token</TableCell>
                  <TableCell>Token Allowance</TableCell>
                  <TableCell>Flow Operator Permissions</TableCell>
                  <TableCell>Flow Operator Allowance</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {senderAddress &&
                  tokenSummaries.map(
                    ({
                      tokenAddress,
                      recommendedTokenAllowance,
                      requiredFlowOperatorPermissions,
                      requiredFlowOperatorAllowance,
                    }) => (
                      <VestingSchedulerAllowanceRow
                        key={tokenAddress}
                        network={network}
                        tokenAddress={tokenAddress}
                        senderAddress={senderAddress}
                        recommendedTokenAllowance={recommendedTokenAllowance}
                        requiredFlowOperatorPermissions={
                          requiredFlowOperatorPermissions
                        }
                        requiredFlowOperatorAllowance={
                          requiredFlowOperatorAllowance
                        }
                      />
                    )
                  )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export const VestingSchedulerAllowanceRow: FC<{
  network: Network;
  tokenAddress: string;
  senderAddress: string;
  recommendedTokenAllowance: BigNumber;
  requiredFlowOperatorPermissions: number; // 5 (Create or Delete) https://docs.superfluid.finance/superfluid/developers/constant-flow-agreement-cfa/cfa-access-control-list-acl/acl-features
  requiredFlowOperatorAllowance: BigNumber;
}> = ({
  network,
  tokenAddress,
  senderAddress,
  recommendedTokenAllowance,
  requiredFlowOperatorPermissions,
  requiredFlowOperatorAllowance,
}) => {
  const vestingSchedulerAllowancesQuery =
    rpcApi.useGetVestingSchedulerAllowancesQuery({
      chainId: network.id,
      tokenAddress: tokenAddress,
      senderAddress: senderAddress,
    });

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: tokenAddress,
  });

  if (!vestingSchedulerAllowancesQuery.data) return <>Loading...</>;

  const { tokenAllowance, flowOperatorPermissions, flowOperatorAllowance } =
    vestingSchedulerAllowancesQuery.data;

  const isEnoughTokenAllowance = recommendedTokenAllowance.lte(tokenAllowance);
  const isEnoughFlowOperatorAllowance = requiredFlowOperatorAllowance.lte(
    flowOperatorAllowance
  );

  const existingPermissions = Number(flowOperatorPermissions);
  const permissionsString =
    flowOperatorPermissionsToString(existingPermissions);

  return (
    <TableRow>
      <TableCell>
        <TokenIcon
          isSuper
          tokenSymbol={tokenQuery.data?.symbol}
          isLoading={tokenQuery.isLoading}
        />
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          {isEnoughTokenAllowance ? (
            <CheckCircleRoundedIcon sx={{ color: "primary.main" }} />
          ) : (
            <DangerousRoundedIcon sx={{ color: "warning.main" }} />
          )}
          <span>
            <Amount wei={tokenAllowance} /> {tokenQuery.data?.symbol}
          </span>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          {isEnoughTokenAllowance ? (
            <CheckCircleRoundedIcon sx={{ color: "primary.main" }} />
          ) : (
            <DangerousRoundedIcon sx={{ color: "warning.main" }} />
          )}
          <span>{permissionsString}</span>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          {isEnoughFlowOperatorAllowance ? (
            <CheckCircleRoundedIcon sx={{ color: "primary.main" }} />
          ) : (
            <DangerousRoundedIcon sx={{ color: "warning.main" }} />
          )}
          <span>
            <Amount wei={flowOperatorAllowance} /> {tokenQuery.data?.symbol}
          </span>
        </Stack>
      </TableCell>
    </TableRow>
  );
};
