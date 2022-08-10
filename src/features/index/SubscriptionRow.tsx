import {
  Button,
  CircularProgress,
  ListItemText,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { IndexSubscription } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { FC, useMemo } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { subscriptionWeiAmountReceived } from "../../utils/tokenUtils";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import { Network } from "../network/networks";
import { PendingIndexSubscriptionApproval } from "../pendingUpdates/PendingIndexSubscriptionApproval";
import usePendingIndexSubscriptionApproval from "../pendingUpdates/usePendingIndexSubscriptionApproval";
import { rpcApi } from "../redux/store";
import Amount from "../token/Amount";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";

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

  const pendingApproval = usePendingIndexSubscriptionApproval({
    chainId: network.id,
    indexId: subscription.indexId,
    tokenAddress: subscription.token,
    publisherAddress: subscription.publisher,
  });

  return (
    <TableRow>
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
            <Typography variant="h7mono">
              <Amount wei={amountReceived} />
            </Typography>
          </TableCell>
          <TableCell>
            <Typography
              variant="body2"
              color={subscription.approved ? "primary" : "warning.main"}
            >
              {subscription.approved ? "Approved" : "Awaiting Approval"}
            </Typography>
          </TableCell>
          <TableCell>
            {format(subscription.updatedAtTimestamp * 1000, "d MMM. yyyy")}
          </TableCell>
        </>
      ) : (
        <TableCell align="right">
          <ListItemText
            primary={<Amount wei={amountReceived} />}
            secondary={subscription.approved ? "Approved" : "Awaiting Approval"}
            primaryTypographyProps={{ variant: "h7mono" }}
            secondaryTypographyProps={{
              variant: "body2",
              color: subscription.approved ? "primary" : "warning.main",
              sx: { whiteSpace: "pre" },
            }}
          />
        </TableCell>
      )}

      <TableCell>
        <TransactionBoundary
          expectedNetwork={network}
          mutationResult={approveSubscriptionResult}
        >
          {({
            mutationResult,
            signer,
            isConnected,
            isCorrectNetwork,
            expectedNetwork,
          }) =>
            !subscription.approved && (
              <>
                {mutationResult.isLoading || pendingApproval ? (
                  <ApprovalProgress pendingUpdate={pendingApproval} />
                ) : (
                  <Button
                    disabled={!signer || !isConnected || !isCorrectNetwork}
                    variant="textContained"
                    color="primary"
                    size="small"
                    onClick={async () => {
                      if (!signer)
                        throw new Error(
                          "Signer should always bet available here."
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
                        overrides: await getTransactionOverrides(network),
                      });
                    }}
                  >
                    Approve
                  </Button>
                )}
              </>
            )
          }
        </TransactionBoundary>
      </TableCell>
    </TableRow>
  );
};

const ApprovalProgress: FC<{
  pendingUpdate: PendingIndexSubscriptionApproval | undefined;
}> = ({ pendingUpdate }) => (
  <Stack direction="row" alignItems="center" gap={1}>
    <CircularProgress color="warning" size="16px" />
    <Typography variant="caption">
      {pendingUpdate?.hasTransactionSucceeded ? "Syncing..." : "Approving..."}
    </Typography>
  </Stack>
);

export default SubscriptionRow;
