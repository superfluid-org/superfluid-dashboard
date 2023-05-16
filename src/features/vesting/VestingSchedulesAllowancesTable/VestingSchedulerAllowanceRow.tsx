import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  Box,
  Collapse,
  IconButton,
  ListItemText,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { BigNumber } from "ethers";
import { FC, useState } from "react";
import { useAccount } from "wagmi";
import OpenIcon from "../../../components/OpenIcon/OpenIcon";
import { flowOperatorPermissionsToString } from "../../../utils/flowOperatorPermissionsToString";
import {
  isCloseToUnlimitedFlowRateAllowance,
  isCloseToUnlimitedTokenAllowance,
} from "../../../utils/isCloseToUnlimitedAllowance";
import { Network } from "../../network/networks";
import { rpcApi, subgraphApi } from "../../redux/store";
import Amount from "../../token/Amount";
import TokenIcon from "../../token/TokenIcon";
import RemoveCircleRoundedIcon from "@mui/icons-material/RemoveCircleRounded";
import FixVestingPermissionsBtn from "./FixVestingPermissionsBtn";
import useActiveAutoWrap from "../useActiveAutoWrap";
import { getSuperTokenType } from "../../redux/endpoints/adHocSubgraphEndpoints";
import { TokenType } from "../../redux/endpoints/tokenTypes";

export const VestingSchedulerAllowanceRowSkeleton = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1}>
          <Skeleton variant="circular" width={36} height={36} />
          <Skeleton width={70} />
        </Stack>
      </TableCell>
      {!isBelowMd && (
        <>
          <TableCell align="center">
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ display: "inline-block" }}
            />
          </TableCell>
          <TableCell align="center">
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ display: "inline-block" }}
            />
          </TableCell>
          <TableCell align="center">
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ display: "inline-block" }}
            />
          </TableCell>
        </>
      )}
      <TableCell align="center">
        <Skeleton
          variant="circular"
          width={24}
          height={24}
          sx={{ display: "inline-block" }}
        />
      </TableCell>
    </TableRow>
  );
};

interface VestingSchedulerAllowanceRowProps {
  isLast: boolean;
  network: Network;
  tokenAddress: string;
  senderAddress: string;
  recommendedTokenAllowance: BigNumber;
  requiredFlowOperatorPermissions: number; // Usually 5 (Create or Delete) https://docs.superfluid.finance/superfluid/developers/constant-flow-agreement-cfa/cfa-access-control-list-acl/acl-features
  requiredFlowRateAllowance: BigNumber;
}

const VestingSchedulerAllowanceRow: FC<VestingSchedulerAllowanceRowProps> = ({
  isLast,
  network,
  tokenAddress,
  senderAddress,
  recommendedTokenAllowance,
  requiredFlowOperatorPermissions,
  requiredFlowRateAllowance,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [isExpanded, setIsExpanded] = useState(false);

  const { data: token, isLoading: isTokenLoading } = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: tokenAddress,
  });

  const isAutoWrappable =
    token &&
    getSuperTokenType({
      network,
      address: token.id,
      underlyingAddress: token.underlyingAddress,
    }) === TokenType.WrapperSuperToken;

  const {
    isAutoWrapLoading,
    activeAutoWrapSchedule,
    isAutoWrapAllowanceSufficient,
  } = useActiveAutoWrap(
    isAutoWrappable
      ? {
          chainId: network.id,
          accountAddress: senderAddress,
          superTokenAddress: token.id,
          underlyingTokenAddress: token.underlyingAddress,
        }
      : "skip"
  );

  const isAutoWrapOK = Boolean(
    activeAutoWrapSchedule && isAutoWrapAllowanceSufficient && isAutoWrappable
  );

  const { address: currentAccountAddress } = useAccount();
  const isSenderLooking =
    currentAccountAddress &&
    senderAddress.toLowerCase() === currentAccountAddress.toLowerCase();

  const vestingSchedulerAllowancesQuery =
    rpcApi.useGetVestingSchedulerAllowancesQuery({
      chainId: network.id,
      tokenAddress: tokenAddress,
      senderAddress: senderAddress,
    });

  if (!vestingSchedulerAllowancesQuery.data) {
    return <VestingSchedulerAllowanceRowSkeleton />;
  }

  const { tokenAllowance, flowOperatorPermissions, flowRateAllowance } =
    vestingSchedulerAllowancesQuery.data;

  const isEnoughTokenAllowance = recommendedTokenAllowance.lte(tokenAllowance);
  const isEnoughFlowRateAllowance =
    requiredFlowRateAllowance.lte(flowRateAllowance);

  const existingPermissions = Number(flowOperatorPermissions);
  const isEnoughFlowOperatorPermissions =
    requiredFlowOperatorPermissions === 0 ||
    existingPermissions & requiredFlowOperatorPermissions;

  const showFixRequiredAccessButton =
    isSenderLooking &&
    (!isEnoughTokenAllowance ||
      !isEnoughFlowRateAllowance ||
      !isEnoughFlowOperatorPermissions);

  const permissionsString =
    flowOperatorPermissionsToString(existingPermissions);
  const requiredPermissionsString = flowOperatorPermissionsToString(
    requiredFlowOperatorPermissions
  );

  const tokenSymbol = token?.symbol || "";

  return (
    <>
      <TableRow
        data-cy={`${tokenSymbol}-row`}
        sx={
          isLast && !isExpanded
            ? {
                ".MuiTableCell-root": {
                  borderBottom: "none",
                },
              }
            : {}
        }
      >
        <TableCell>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <TokenIcon
              isSuper
              tokenSymbol={tokenSymbol}
              isLoading={isTokenLoading}
            />
            <ListItemText primary={tokenSymbol} />
          </Stack>
        </TableCell>
        {!isBelowMd && (
          <>
            <TableCell>
              <Stack direction="column" spacing={1} alignItems="center">
                {isEnoughTokenAllowance ? (
                  <CheckCircleRoundedIcon
                    data-cy={`${tokenSymbol}-allowance-status`}
                    color="primary"
                  />
                ) : (
                  <CancelRoundedIcon
                    data-cy={`${tokenSymbol}-allowance-status`}
                    color="error"
                  />
                )}
              </Stack>
            </TableCell>
            <TableCell>
              <Stack direction="column" spacing={1} alignItems="center">
                {isEnoughFlowOperatorPermissions ? (
                  <CheckCircleRoundedIcon
                    data-cy={`${tokenSymbol}-permission-status`}
                    color="primary"
                  />
                ) : (
                  <CancelRoundedIcon
                    data-cy={`${tokenSymbol}-permission-status`}
                    color="error"
                  />
                )}
              </Stack>
            </TableCell>
            <TableCell>
              <Stack direction="column" spacing={1} alignItems="center">
                {isEnoughFlowRateAllowance ? (
                  <CheckCircleRoundedIcon
                    data-cy={`${tokenSymbol}-flow-allowance-status`}
                    color="primary"
                  />
                ) : (
                  <CancelRoundedIcon
                    data-cy={`${tokenSymbol}-flow-allowance-status`}
                    color="error"
                  />
                )}
              </Stack>
            </TableCell>
            {network.autoWrap && (
              <TableCell align="center">
                {isAutoWrapLoading ? (
                  <Skeleton variant="circular" width={24} height={24} />
                ) : isAutoWrapOK ? (
                  <CheckCircleRoundedIcon
                    data-cy={`${tokenSymbol}-auto-wrap-status`}
                    color="primary"
                  />
                ) : isAutoWrappable ? (
                  <RemoveCircleRoundedIcon
                    data-cy={`${tokenSymbol}-auto-wrap-status`}
                    color="warning"
                  />
                ) : null}
              </TableCell>
            )}
          </>
        )}
        <TableCell>
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            <OpenIcon open={isExpanded} />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={isBelowMd ? 2 : 6}
          sx={{
            minHeight: 0,
            p: 0,
            [theme.breakpoints.down("md")]: {
              p: 0,
            },
            transition: theme.transitions.create("border-width", {
              duration: theme.transitions.duration.standard,
            }),
            ...(isLast || !isExpanded ? { borderWidth: "0" } : {}),
          }}
        >
          <Collapse
            in={isExpanded}
            timeout={theme.transitions.duration.standard}
            mountOnEnter
          >
            {!isBelowMd ? (
              <Table sx={{ width: "100%" }}>
                <TableBody>
                  <TableRow
                    sx={{
                      "& .MuiTypography-body2": {
                        fontSize: "1rem",
                      },
                    }}
                  >
                    <TableCell>
                      {showFixRequiredAccessButton && (
                        <FixVestingPermissionsBtn
                          network={network}
                          senderAddress={senderAddress}
                          tokenAddress={tokenAddress}
                          recommendedTokenAllowance={recommendedTokenAllowance}
                          requiredFlowOperatorPermissions={
                            requiredFlowOperatorPermissions
                          }
                          requiredFlowRateAllowance={requiredFlowRateAllowance}
                        />
                      )}
                    </TableCell>
                    <TableCell width="200px">
                      <ListItemText
                        data-cy={`${tokenSymbol}-current-allowance`}
                        primary="Current"
                        secondary={
                          isCloseToUnlimitedTokenAllowance(tokenAllowance) ? (
                            <span>Unlimited</span>
                          ) : (
                            <>
                              <Amount wei={tokenAllowance} /> {tokenSymbol}
                            </>
                          )
                        }
                      />
                      <ListItemText
                        data-cy={`${tokenSymbol}-recommended-allowance`}
                        primary="Required"
                        secondary={
                          <>
                            <Amount wei={recommendedTokenAllowance} />{" "}
                            {tokenSymbol}
                          </>
                        }
                      />
                    </TableCell>
                    <TableCell width="220px">
                      <ListItemText
                        primary="Current"
                        data-cy={`${tokenSymbol}-current-permissions`}
                        secondary={permissionsString}
                      />
                      <ListItemText
                        data-cy={`${tokenSymbol}-recommended-permissions`}
                        primary="Required"
                        secondary={requiredPermissionsString}
                      />
                    </TableCell>
                    <TableCell width={network.autoWrap ? "380px" : "280px"}>
                      <ListItemText
                        data-cy={`${tokenSymbol}-current-flow-allowance`}
                        primary="Current"
                        secondary={
                          isCloseToUnlimitedFlowRateAllowance(
                            flowRateAllowance
                          ) ? (
                            <span>Unlimited</span>
                          ) : (
                            <>
                              <Amount wei={flowRateAllowance} /> {tokenSymbol}
                              /sec
                            </>
                          )
                        }
                      />
                      <ListItemText
                        data-cy={`${tokenSymbol}-recommended-flow-allowance`}
                        primary="Required"
                        secondary={
                          <>
                            <Amount wei={requiredFlowRateAllowance} />{" "}
                            {tokenSymbol}
                            /sec
                          </>
                        }
                      />
                    </TableCell>
                    <TableCell width="100px" />
                  </TableRow>
                </TableBody>
              </Table>
            ) : (
              <Stack gap={2} sx={{ px: 2, py: 2 }}>
                <Box>
                  <Typography variant="h7">Token Allowance</Typography>
                  <Stack
                    gap={1}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">Current:</Typography>
                    <Typography variant="h6">
                      {isCloseToUnlimitedTokenAllowance(tokenAllowance) ? (
                        <span>Unlimited</span>
                      ) : (
                        <>
                          <Amount wei={tokenAllowance} /> {tokenSymbol}
                        </>
                      )}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">Required:</Typography>
                    <Typography variant="h6">
                      <Amount wei={recommendedTokenAllowance} /> {tokenSymbol}
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="h7">Stream Permissions</Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">Current:</Typography>
                    <Typography variant="h6">{permissionsString}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">Required:</Typography>
                    <Typography variant="h6">
                      {requiredPermissionsString}
                    </Typography>
                  </Stack>
                </Box>
                <Box>
                  <Typography variant="h7">Stream Allowance</Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">Current:</Typography>
                    <Typography variant="h6">
                      {isCloseToUnlimitedFlowRateAllowance(
                        flowRateAllowance
                      ) ? (
                        <span>Unlimited</span>
                      ) : (
                        <>
                          <Amount wei={flowRateAllowance} /> {tokenSymbol}
                          /sec
                        </>
                      )}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2">Required:</Typography>
                    <Typography variant="h6">
                      <Amount wei={requiredFlowRateAllowance} /> {tokenSymbol}
                      /sec
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default VestingSchedulerAllowanceRow;
