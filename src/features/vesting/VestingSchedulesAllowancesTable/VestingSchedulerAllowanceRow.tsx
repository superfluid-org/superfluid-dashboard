import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DangerousRoundedIcon from "@mui/icons-material/DangerousRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import {
  TableCellProps,
  TableRow,
  TableCell,
  Stack,
  ListItemText,
  IconButton,
  Collapse,
} from "@mui/material";
import { BigNumber } from "ethers";
import { FC, useState } from "react";
import { flowOperatorPermissionsToString } from "../../../utils/flowOperatorPermissionsToString";
import { rpcApi, subgraphApi } from "../../redux/store";
import Amount from "../../token/Amount";
import TokenIcon from "../../token/TokenIcon";
import { Network } from "../../network/networks";

interface VestingSchedulerAllowanceRowProps {
  network: Network;
  tokenAddress: string;
  senderAddress: string;
  recommendedTokenAllowance: BigNumber;
  requiredFlowOperatorPermissions: number; // 5 (Create or Delete) https://docs.superfluid.finance/superfluid/developers/constant-flow-agreement-cfa/cfa-access-control-list-acl/acl-features
  requiredFlowOperatorAllowance: BigNumber;
}

const VestingSchedulerAllowanceRow: FC<VestingSchedulerAllowanceRowProps> = ({
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

  const collapsibleTableCellProps: TableCellProps = {
    sx: {
      pt: 0,
      pb: 0,
    },
  };

  return (
    <>
      <TableRow
        sx={{
          border: "none",
        }}
      >
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
        <TableCell {...collapsibleTableCellProps}></TableCell>
        <TableCell {...collapsibleTableCellProps}>
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
        <TableCell {...collapsibleTableCellProps}>
          <Collapse in={isExpanded}>
            <ListItemText primary="Current" secondary={permissionsString} />
            <ListItemText
              primary="Recommended"
              secondary={requiredPermissionsString}
            />
          </Collapse>
        </TableCell>
        <TableCell {...collapsibleTableCellProps}>
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
        <TableCell {...collapsibleTableCellProps}></TableCell>
      </TableRow>
    </>
  );
};

export default VestingSchedulerAllowanceRow;
