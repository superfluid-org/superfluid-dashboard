import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Collapse,
  IconButton,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { BigNumber } from "ethers";
import { groupBy, uniq } from "lodash";
import { FC, useState } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { Network } from "../network/networks";
import { rpcApi, subgraphApi } from "../redux/store";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DangerousRoundedIcon from "@mui/icons-material/DangerousRounded";
import TokenIcon from "../token/TokenIcon";
import Amount from "../token/Amount";
import { flowOperatorPermissionsToString } from "../../utils/flowOperatorPermissionsToString";
import Link from "../common/Link";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import TooltipIcon from "../common/TooltipIcon";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { CopyIconBtn } from "../common/CopyIconBtn";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import { vestingSubgraphApi } from "../../vesting-subgraph/vestingSubgraphApi";

export const VestingSchedulerAllowances: FC = () => {
  const { network } = useExpectedNetwork();
  const { visibleAddress: senderAddress } = useVisibleAddress();

  const { data: vestingSchedulerConstants } =
    rpcApi.useGetVestingSchedulerConstantsQuery({
      chainId: network.id,
    });

  const vestingSchedulesQuery = vestingSubgraphApi.useGetVestingSchedulesQuery(
    senderAddress
      ? {
          chainId: network.id,
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
              Vesting Contract, Allowances and Permissions{" "}
              <Typography variant="caption">(Advanced)</Typography>
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {network.vestingContractAddress && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <Typography>Vesting Contract:</Typography>
              <Typography>
                {getAddress(network.vestingContractAddress)}
              </Typography>
              <CopyIconBtn
                copyText={getAddress(network.vestingContractAddress)}
                description="Copy address to clipboard"
              />
              <Tooltip
                title="View on blockchain explorer"
                arrow
                placement="top"
              >
                <Link
                  passHref
                  href={network.getLinkForAddress(
                    network.vestingContractAddress
                  )}
                  target="_blank"
                >
                  <IconButton href="" target="_blank">
                    <LaunchRoundedIcon />
                  </IconButton>
                </Link>
              </Tooltip>
            </Stack>
          )}
          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Token</TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography>Token Allowance</Typography>
                      <TooltipIcon title="The token allowance needed by the contract for cliff & compensation transfers." />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography>Flow Operator Permissions</Typography>
                      <TooltipIcon title="The flow operator permissions needed by the contract for creating & deletion of Superfluid flows." />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography>Flow Operator Allowance</Typography>
                      <TooltipIcon title="The flow operator allowance needed by the contract for creating Superfluid flows." />
                    </Stack>
                  </TableCell>
                  <TableCell></TableCell>
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

  const [isExpanded, setIsExpanded] = useState(false);

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
  const requiredPermissionsString = flowOperatorPermissionsToString(
    requiredFlowOperatorPermissions
  );
  const isEnoughFlowOperatorPermissions =
    existingPermissions & requiredFlowOperatorPermissions;

  return (
    <>
      <TableRow>
        <TableCell>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <TokenIcon
              isSuper
              tokenSymbol={tokenQuery.data?.symbol}
              isLoading={tokenQuery.isLoading}
            />
            <ListItemText primary={tokenQuery.data?.symbol} />
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="column" spacing={1} alignItems="center">
            {isEnoughTokenAllowance ? (
              <CheckCircleRoundedIcon sx={{ color: "primary.main" }} />
            ) : (
              <DangerousRoundedIcon sx={{ color: "warning.main" }} />
            )}
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="column" spacing={1} alignItems="center">
            {isEnoughFlowOperatorPermissions ? (
              <CheckCircleRoundedIcon sx={{ color: "primary.main" }} />
            ) : (
              <DangerousRoundedIcon sx={{ color: "warning.main" }} />
            )}
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="column" spacing={1} alignItems="center">
            {isEnoughFlowOperatorAllowance ? (
              <CheckCircleRoundedIcon sx={{ color: "primary.main" }} />
            ) : (
              <DangerousRoundedIcon sx={{ color: "warning.main" }} />
            )}
          </Stack>
        </TableCell>
        <TableCell>
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell></TableCell>
        <TableCell>
          <Collapse in={isExpanded}>
            <ListItemText
              primary="Current"
              secondary={
                <span>
                  <Amount wei={tokenAllowance} /> {tokenQuery.data?.symbol}
                </span>
              }
            />
            <ListItemText
              primary="Recommended"
              secondary={
                <span>
                  <Amount wei={recommendedTokenAllowance} />{" "}
                  {tokenQuery.data?.symbol}
                </span>
              }
            />
          </Collapse>
        </TableCell>
        <TableCell>
          <Collapse in={isExpanded}>
            <ListItemText primary="Current" secondary={permissionsString} />
            <ListItemText
              primary="Recommended"
              secondary={requiredPermissionsString}
            />
          </Collapse>
        </TableCell>
        <TableCell>
          <Collapse in={isExpanded}>
            <ListItemText
              primary="Current"
              secondary={
                <span>
                  <Amount wei={flowOperatorAllowance} />{" "}
                  {tokenQuery.data?.symbol}
                  /sec
                </span>
              }
            />
            <ListItemText
              primary="Recommended"
              secondary={
                <span>
                  <Amount wei={requiredFlowOperatorAllowance} />{" "}
                  {tokenQuery.data?.symbol}/sec
                </span>
              }
            />
          </Collapse>
        </TableCell>
        <TableCell></TableCell>
      </TableRow>
    </>
  );
};
