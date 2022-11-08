import {
  CircularProgress,
  IconButton,
  ListItemText,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { IndexSubscription } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { FC, useMemo } from "react";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { subscriptionWeiAmountReceived } from "../../utils/tokenUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import { Network } from "../network/networks";
import { usePendingIndexSubscriptionApprove } from "../pendingUpdates/PendingIndexSubscriptionApprove";
import { usePendingIndexSubscriptionRevoke } from "../pendingUpdates/PendingIndexSubscriptionRevoke";
import { PendingUpdate } from "../pendingUpdates/PendingUpdate";
import { rpcApi } from "../redux/store";
import Amount from "../token/Amount";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import ConnectionBoundary, {
  useConnectionBoundary,
} from "../transactionBoundary/ConnectionBoundary";

export const SubscriptionLoadingRow = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <TableRow>
      {!isBelowMd ? (
        <>
          <TableCell>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Skeleton
                variant="circular"
                width={24}
                height={24}
                sx={{ borderRadius: "10px" }}
              />
              <Typography variant="h6">
                <Skeleton width={100} />
              </Typography>
            </Stack>
          </TableCell>
          <TableCell>
            <Typography variant="body2mono">
              <Skeleton width={150} />
            </Typography>
          </TableCell>
          <TableCell>
            <Skeleton width={150} />
          </TableCell>
          <TableCell>
            <Skeleton width={100} />
          </TableCell>
        </>
      ) : (
        <>
          <TableCell>
            <Stack direction="row" alignItems="center" gap={1.5}>
              <Skeleton
                variant="circular"
                width={24}
                height={24}
                sx={{ borderRadius: "10px" }}
              />
              <Stack>
                <Skeleton width={80} />
                <Skeleton width={60} />
              </Stack>
            </Stack>
          </TableCell>
          <TableCell>
            <Stack alignItems="end">
              <Skeleton width={60} />
              <Skeleton width={40} />
            </Stack>
          </TableCell>
        </>
      )}
    </TableRow>
  );
};

interface SubscriptionRowProps {
  subscription: IndexSubscription;
  network: Network;
}

const SubscriptionRow: FC<SubscriptionRowProps> = ({
  subscription,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const {
    indexValueCurrent,
    totalAmountReceivedUntilUpdatedAt,
    indexValueUntilUpdatedAt,
    units,
  } = subscription;

  const amountReceived = useMemo(
    () =>
      subscriptionWeiAmountReceived(
        BigNumber.from(indexValueCurrent),
        BigNumber.from(totalAmountReceivedUntilUpdatedAt),
        BigNumber.from(indexValueUntilUpdatedAt),
        BigNumber.from(units)
      ),
    [
      indexValueCurrent,
      totalAmountReceivedUntilUpdatedAt,
      indexValueUntilUpdatedAt,
      units,
    ]
  );

  const getTransactionOverrides = useGetTransactionOverrides();

  const [approveSubscription, approveSubscriptionResult] =
    rpcApi.useIndexSubscriptionApproveMutation();
  const [revokeSubscription, revokeSubscriptionResult] =
    rpcApi.useIndexSubscriptionRevokeMutation();

  const pendingApproval = usePendingIndexSubscriptionApprove({
    chainId: network.id,
    indexId: subscription.indexId,
    tokenAddress: subscription.token,
    publisherAddress: subscription.publisher,
  });

  const pendingRevoke = usePendingIndexSubscriptionRevoke({
    chainId: network.id,
    indexId: subscription.indexId,
    tokenAddress: subscription.token,
    publisherAddress: subscription.publisher,
  });

  return (
    <TableRow data-cy={"distribution-row"}>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <AddressAvatar
            address={subscription.publisher}
            AvatarProps={{
              sx: { width: "24px", height: "24px", borderRadius: "5px" },
            }}
            BlockiesProps={{ size: 8, scale: 3 }}
          />
          <ListItemText
            data-cy="publisher"
            primary={
              <AddressCopyTooltip address={subscription.publisher}>
                <span>
                  <AddressName address={subscription.publisher} />
                </span>
              </AddressCopyTooltip>
            }
            secondary={
              isBelowMd
                ? format(subscription.updatedAtTimestamp * 1000, "d MMM. yyyy")
                : undefined
            }
            primaryTypographyProps={{ variant: "h7" }}
          />
        </Stack>
      </TableCell>

      {!isBelowMd ? (
        <>
          <TableCell>
            <Typography data-cy="amount-received" variant="h7mono">
              <Amount wei={amountReceived} />
            </Typography>
          </TableCell>
          <TableCell>
            <Typography
              data-cy={"status"}
              variant="body2"
              color={subscription.approved ? "primary" : "warning.main"}
              translate="yes"
            >
              {subscription.approved ? (
                <span>Approved</span>
              ) : (
                <span>Awaiting Approval</span>
              )}
            </Typography>
          </TableCell>
          <TableCell data-cy={"last-updated-at"}>
            {format(subscription.updatedAtTimestamp * 1000, "d MMM. yyyy")}
          </TableCell>
        </>
      ) : (
        <TableCell align="right">
          <ListItemText
            data-cy={"mobile-amount-and-status"}
            primary={<Amount wei={amountReceived} />}
            secondary={
              subscription.approved ? (
                <span>Approved</span>
              ) : (
                <span>Awaiting Approval</span>
              )
            }
            primaryTypographyProps={{ variant: "h7mono" }}
            secondaryTypographyProps={{
              variant: "body2",
              translate: "yes",
              color: subscription.approved ? "primary" : "warning.main",
              sx: { whiteSpace: "pre" },
            }}
          />
        </TableCell>
      )}

      <TableCell>
        <ConnectionBoundary expectedNetwork={network}>
          {({ isConnected, isCorrectNetwork, expectedNetwork }) => (
            <>
              <TransactionBoundary mutationResult={approveSubscriptionResult}>
                {({ mutationResult, signer, setDialogLoadingInfo }) =>
                  !subscription.approved && (
                    <>
                      {mutationResult.isLoading || pendingApproval ? (
                        <OperationProgress
                          transactingText={"Approving..."}
                          pendingUpdate={pendingApproval}
                        />
                      ) : (
                        <Tooltip
                          arrow
                          disableInteractive
                          title={
                            !isConnected ? (
                              <span>
                                Connect wallet to approve subscription
                              </span>
                            ) : !isCorrectNetwork ? (
                              <span>
                                Switch network to{" "}
                                <span translate="no">{network.name}</span> to
                                approve subscription
                              </span>
                            ) : (
                              <span>Approve subscription</span>
                            )
                          }
                        >
                          <span>
                            <IconButton
                              data-cy={"approve-button"}
                              color="primary"
                              size="small"
                              disabled={
                                !signer || !isConnected || !isCorrectNetwork
                              }
                              onClick={async () => {
                                if (!signer)
                                  throw new Error(
                                    "Signer should always be available here."
                                  );

                                setDialogLoadingInfo(
                                  <Typography
                                    data-cy={"approve-index-message"}
                                    variant="h5"
                                    color="text.secondary"
                                    translate="yes"
                                  >
                                    You are approving an index subscription.
                                  </Typography>
                                );

                                // TODO(KK): Make the operation take subscriber as input. Don't just rely on the wallet's signer -- better to have explicit data flowing
                                approveSubscription({
                                  signer,
                                  chainId: expectedNetwork.id,
                                  indexId: subscription.indexId,
                                  publisherAddress: subscription.publisher,
                                  superTokenAddress: subscription.token,
                                  userDataBytes: undefined,
                                  waitForConfirmation: false,
                                  overrides: await getTransactionOverrides(
                                    network
                                  ),
                                });
                              }}
                            >
                              <CheckCircleRoundedIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </>
                  )
                }
              </TransactionBoundary>
              <TransactionBoundary mutationResult={revokeSubscriptionResult}>
                {({ mutationResult, signer, setDialogLoadingInfo }) =>
                  subscription.approved && (
                    <>
                      {mutationResult.isLoading || pendingRevoke ? (
                        <OperationProgress
                          transactingText={"Revoking..."}
                          pendingUpdate={pendingRevoke}
                        />
                      ) : (
                        <Tooltip
                          arrow
                          disableInteractive
                          title={
                            !isConnected ? (
                              <span>Connect wallet to revoke subscription</span>
                            ) : !isCorrectNetwork ? (
                              <span>
                                Switch network to{" "}
                                <span translate="no">{network.name}</span> to
                                revoke subscription
                              </span>
                            ) : (
                              <span>Revoke subscription</span>
                            )
                          }
                        >
                          <span>
                            <IconButton
                              data-cy={"revoke-button"}
                              color="error"
                              size="small"
                              disabled={
                                !signer || !isConnected || !isCorrectNetwork
                              }
                              onClick={async () => {
                                if (!signer)
                                  throw new Error(
                                    "Signer should always bet available here."
                                  );

                                setDialogLoadingInfo(
                                  <Typography
                                    data-cy={"revoke-message"}
                                    variant="h5"
                                    color="text.secondary"
                                    translate="yes"
                                  >
                                    You are revoking approval of an index
                                    subscription.
                                  </Typography>
                                );

                                // TODO(KK): Make the operation take subscriber as input. Don't just rely on the wallet's signer -- better to have explicit data flowing
                                revokeSubscription({
                                  signer,
                                  chainId: expectedNetwork.id,
                                  indexId: subscription.indexId,
                                  publisherAddress: subscription.publisher,
                                  superTokenAddress: subscription.token,
                                  userDataBytes: undefined,
                                  waitForConfirmation: false,
                                  overrides: await getTransactionOverrides(
                                    network
                                  ),
                                });
                              }}
                            >
                              <CancelRoundedIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}
                    </>
                  )
                }
              </TransactionBoundary>
            </>
          )}
        </ConnectionBoundary>
      </TableCell>
    </TableRow>
  );
};

// TODO(KK): Consider making this re-used with stream cancellation?
const OperationProgress: FC<{
  pendingUpdate: PendingUpdate | undefined;
  transactingText: string;
}> = ({ pendingUpdate, transactingText }) => (
  <Stack direction="row" alignItems="center" gap={1}>
    <CircularProgress color="warning" size="16px" />
    <Typography data-cy={"pending-message"} variant="caption" translate="yes">
      {pendingUpdate?.hasTransactionSucceeded ? (
        <span>Syncing...</span>
      ) : (
        <span>{transactingText}</span>
      )}
    </Typography>
  </Stack>
);

export default SubscriptionRow;
