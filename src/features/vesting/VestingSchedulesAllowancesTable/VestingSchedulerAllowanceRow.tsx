import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DangerousRoundedIcon from "@mui/icons-material/DangerousRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import {
  TableRow,
  TableCell,
  Stack,
  ListItemText,
  IconButton,
  Collapse,
} from "@mui/material";
import { BigNumber } from "ethers";
import { FC, useState } from "react";
import { rpcApi, subgraphApi } from "../../redux/store";
import TokenIcon from "../../token/TokenIcon";
import { Network } from "../../network/networks";
import { useTheme } from "@mui/material/styles";
import VestingSchedulerAllowanceDetailsTable from "./VestingSchedulerAllowanceDetailsTable";

interface VestingSchedulerAllowanceRowProps {
  isLast: boolean;
  network: Network;
  tokenAddress: string;
  senderAddress: string;
  recommendedTokenAllowance: BigNumber;
  requiredFlowOperatorPermissions: number; // 5 (Create or Delete) https://docs.superfluid.finance/superfluid/developers/constant-flow-agreement-cfa/cfa-access-control-list-acl/acl-features
  requiredFlowOperatorAllowance: BigNumber;
}

const VestingSchedulerAllowanceRow: FC<VestingSchedulerAllowanceRowProps> = ({
  isLast,
  network,
  tokenAddress,
  senderAddress,
  recommendedTokenAllowance,
  requiredFlowOperatorPermissions,
  requiredFlowOperatorAllowance,
}) => {
  const theme = useTheme();
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

  // TODO: Return skeleton table
  if (!vestingSchedulerAllowancesQuery.data) return <>Loading...</>;

  const { tokenAllowance, flowOperatorPermissions, flowOperatorAllowance } =
    vestingSchedulerAllowancesQuery.data;

  const isEnoughTokenAllowance = recommendedTokenAllowance.lte(tokenAllowance);
  const isEnoughFlowOperatorAllowance = requiredFlowOperatorAllowance.lte(
    flowOperatorAllowance
  );

  const existingPermissions = Number(flowOperatorPermissions);

  const isEnoughFlowOperatorPermissions =
    existingPermissions & requiredFlowOperatorPermissions;

  return (
    <>
      <TableRow
        sx={
          isLast && !isExpanded
            ? {
                ".MuiTableCell-root": {
                  border: "none",
                },
              }
            : {}
        }
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
              <CheckCircleRoundedIcon color="primary" />
            ) : (
              <DangerousRoundedIcon color="error" />
            )}
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="column" spacing={1} alignItems="center">
            {isEnoughFlowOperatorPermissions ? (
              <CheckCircleRoundedIcon color="primary" />
            ) : (
              <DangerousRoundedIcon color="error" />
            )}
          </Stack>
        </TableCell>
        <TableCell>
          <Stack direction="column" spacing={1} alignItems="center">
            {isEnoughFlowOperatorAllowance ? (
              <CheckCircleRoundedIcon color="primary" />
            ) : (
              <DangerousRoundedIcon color="error" />
            )}
          </Stack>
        </TableCell>
        <TableCell>
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow sx={isLast ? { ".MuiTableCell-root": { border: "none" } } : {}}>
        <TableCell
          colSpan={5}
          sx={{
            border: "none",
            minHeight: 0,
            p: 0,
          }}
        >
          <Collapse
            in={isExpanded}
            timeout={theme.transitions.duration.standard}
            unmountOnExit
          >
            <VestingSchedulerAllowanceDetailsTable
              tokenSymbol={tokenQuery.data?.symbol || ""}
              tokenAllowance={tokenAllowance}
              flowOperatorAllowance={flowOperatorAllowance}
              recommendedTokenAllowance={recommendedTokenAllowance}
              requiredFlowOperatorAllowance={requiredFlowOperatorAllowance}
              existingPermissions={existingPermissions}
              requiredFlowOperatorPermissions={requiredFlowOperatorPermissions}
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default VestingSchedulerAllowanceRow;
