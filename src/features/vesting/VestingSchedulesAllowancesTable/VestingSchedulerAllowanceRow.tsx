import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import {
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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { BigNumber } from "ethers";
import { FC, useState } from "react";
import { useAccount } from "wagmi";
import { flowOperatorPermissionsToString } from "../../../utils/flowOperatorPermissionsToString";
import { useAnalytics } from "../../analytics/useAnalytics";
import { Network } from "../../network/networks";
import { rpcApi, subgraphApi } from "../../redux/store";
import Amount from "../../token/Amount";
import TokenIcon from "../../token/TokenIcon";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import OpenIcon from "../../../components/OpenIcon/OpenIcon";

export const VestingSchedulerAllowanceRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Stack direction="row" alignItems="center" gap={1}>
        <Skeleton variant="circular" width={36} height={36} />
        <Skeleton width={70} />
      </Stack>
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
  </TableRow>
);

interface VestingSchedulerAllowanceRowProps {
  isLast: boolean;
  network: Network;
  tokenAddress: string;
  senderAddress: string;
  recommendedTokenAllowance: BigNumber;
  requiredFlowOperatorPermissions: number; // Usually 5 (Create or Delete) https://docs.superfluid.finance/superfluid/developers/constant-flow-agreement-cfa/cfa-access-control-list-acl/acl-features
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
  const [isExpanded, setIsExpanded] = useState(false);

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: tokenAddress,
  });

  const vestingSchedulerAllowancesQuery =
    rpcApi.useGetVestingSchedulerAllowancesQuery({
      chainId: network.id,
      tokenAddress: tokenAddress,
      senderAddress: senderAddress,
    });

  const { txAnalytics } = useAnalytics();
  const [fixAccess, fixAccessResult] = rpcApi.useFixAccessForVestingMutation();

  const { address: currentAccountAddress } = useAccount();
  const isSenderLooking =
    currentAccountAddress &&
    senderAddress.toLowerCase() === currentAccountAddress.toLowerCase();

  if (!vestingSchedulerAllowancesQuery.data) {
    return <VestingSchedulerAllowanceRowSkeleton />;
  }

  const { tokenAllowance, flowOperatorPermissions, flowOperatorAllowance } =
    vestingSchedulerAllowancesQuery.data;

  const isEnoughTokenAllowance = recommendedTokenAllowance.lte(tokenAllowance);
  const isEnoughFlowOperatorAllowance = requiredFlowOperatorAllowance.lte(
    flowOperatorAllowance
  );

  const existingPermissions = Number(flowOperatorPermissions);
  const isEnoughFlowOperatorPermissions =
    requiredFlowOperatorPermissions === 0 ||
    existingPermissions & requiredFlowOperatorPermissions;

  const showFixRequiredAccessButton =
    isSenderLooking &&
    (!isEnoughTokenAllowance ||
      !isEnoughFlowOperatorAllowance ||
      !isEnoughFlowOperatorPermissions);

  const permissionsString =
    flowOperatorPermissionsToString(existingPermissions);
  const requiredPermissionsString = flowOperatorPermissionsToString(
    requiredFlowOperatorPermissions
  );

  const token = tokenQuery.data;
  const tokenSymbol = token?.symbol || "";

  return (
    <>
      <TableRow
        data-cy={`${tokenQuery.data?.symbol}-row`}
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
              tokenSymbol={tokenSymbol}
              isLoading={tokenQuery.isLoading}
            />
            <ListItemText primary={tokenSymbol} />
          </Stack>
        </TableCell>
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
            {isEnoughFlowOperatorAllowance ? (
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
        <TableCell>
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            <OpenIcon open={isExpanded} />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow sx={isLast ? { ".MuiTableCell-root": { border: "none" } } : {}}>
        <TableCell
          colSpan={5}
          sx={{
            minHeight: 0,
            p: 0,
          }}
        >
          <Collapse
            in={isExpanded}
            timeout={theme.transitions.duration.standard}
            mountOnEnter
          >
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
                      <TransactionBoundary mutationResult={fixAccessResult}>
                        {({ setDialogLoadingInfo }) => (
                          <TransactionButton
                            ButtonProps={{
                              size: "medium",
                              fullWidth: false,
                              variant: "contained",
                            }}
                            onClick={async (signer) => {
                              if (!network.vestingContractAddress) {
                                throw new Error(
                                  "No vesting contract configured for network. Should never happen!"
                                );
                              }

                              setDialogLoadingInfo(
                                <Typography
                                  variant="h5"
                                  color="text.secondary"
                                  translate="yes"
                                >
                                  You are fixing access for the vesting smart
                                  contract so that it could be correctly
                                  executed.
                                </Typography>
                              );

                              const primaryArgs = {
                                chainId: network.id,
                                superTokenAddress: tokenAddress,
                                senderAddress: senderAddress,
                                requiredTokenAllowanceWei:
                                  recommendedTokenAllowance.toString(),
                                requiredFlowOperatorPermissions:
                                  requiredFlowOperatorPermissions,
                                requiredFlowRateAllowanceWei:
                                  requiredFlowOperatorAllowance.toString(),
                              };
                              fixAccess({
                                ...primaryArgs,
                                signer,
                                waitForConfirmation: false,
                              })
                                .unwrap()
                                .then(
                                  ...txAnalytics(
                                    "Fix Access for Vesting",
                                    primaryArgs
                                  )
                                )
                                .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
                            }}
                          >
                            Fix Access
                          </TransactionButton>
                        )}
                      </TransactionBoundary>
                    )}
                  </TableCell>
                  <TableCell width="220px">
                    <ListItemText
                      data-cy={`${tokenSymbol}-current-allowance`}
                      primary="Current"
                      secondary={
                        <>
                          <Amount wei={tokenAllowance} /> {tokenSymbol}
                        </>
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
                  <TableCell width="260px">
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
                  <TableCell width="350px">
                    <ListItemText
                      data-cy={`${tokenSymbol}-current-flow-allowance`}
                      primary="Current"
                      secondary={
                        <>
                          <Amount wei={flowOperatorAllowance} /> {tokenSymbol}
                          /sec
                        </>
                      }
                    />
                    <ListItemText
                      data-cy={`${tokenSymbol}-recommended-flow-allowance`}
                      primary="Required"
                      secondary={
                        <>
                          <Amount wei={requiredFlowOperatorAllowance} />{" "}
                          {tokenSymbol}
                          /sec
                        </>
                      }
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default VestingSchedulerAllowanceRow;
