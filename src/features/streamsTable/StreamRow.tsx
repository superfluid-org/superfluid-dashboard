import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import {
  Button,
  CircularProgress,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  MenuList,
  Popover,
  Skeleton,
  Stack,
  TableCell,
  TableCellProps,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Stream } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { FC, memo, MouseEvent, useState } from "react";
import { useNetwork, useSigner } from "wagmi";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { Network } from "../network/networks";
import { PendingOutgoingStream } from "../pendingUpdates/PendingOutgoingStream";
import usePendingStreamCancellation from "../pendingUpdates/usePendingStreamCancellation";
import { rpcApi } from "../redux/store";
import { UnitOfTime } from "../send/FlowRateInput";
import Ether from "../token/Ether";
import FlowingBalance from "../token/FlowingBalance";
import {
  TransactionDialog,
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactions/TransactionDialog";
import {
  transactionByHashSelector,
  useAccountTransactionsSelector,
} from "../wallet/useAccountTransactions";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";

export const StreamRowLoading = () => (
  <TableRow>
    <TableCell>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton
          variant="circular"
          width={36}
          height={36}
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
      <Typography variant="body2mono">
        <Skeleton width={150} />
      </Typography>
    </TableCell>
    <TableCell>
      <Skeleton width={100} />
    </TableCell>
    <TableCell>
      <Skeleton width={60} />
    </TableCell>
  </TableRow>
);

interface StreamRowProps {
  stream: Stream | PendingOutgoingStream;
  network: Network;
}

const StreamRow: FC<StreamRowProps> = ({ stream, network }) => {
  const {
    id,
    token,
    sender,
    receiver,
    currentFlowRate,
    streamedUntilUpdatedAt,
    createdAtTimestamp,
    updatedAtTimestamp,
  } = stream;

  const router = useRouter();
  const { visibleAddress } = useVisibleAddress();
  const { activeChain } = useNetwork();
  const { data: signer } = useSigner();
  const getTransactionOverrides = useGetTransactionOverrides();

  const [flowDeleteTrigger, flowDeleteMutation] =
    rpcApi.useFlowDeleteMutation();

  const flowDeleteTransaction = useAccountTransactionsSelector(
    transactionByHashSelector(flowDeleteMutation.data?.hash)
  );

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const openStreamDetails = () => {
    router.push(`/${network.slugName}/stream?stream=${id}`);
  };

  const openMenu = (event: MouseEvent<HTMLButtonElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => setMenuAnchor(null);

  const closeCancelDialog = () => setShowCancelDialog(false);

  const deleteStream = async () => {
    if (!signer) {
      throw new Error("Signer is not set.");
    }

    flowDeleteTrigger({
      signer,
      chainId: network.id,
      receiverAddress: receiver,
      senderAddress: sender,
      superTokenAddress: stream.token,
      userDataBytes: undefined,
      waitForConfirmation: false,
      overrides: await getTransactionOverrides(network),
    }).unwrap();
    closeMenu();
    setShowCancelDialog(true);
  };

  const isOutgoing = visibleAddress?.toLowerCase() === sender.toLowerCase();

  const isPending = !!(stream as PendingOutgoingStream).pendingType;
  const isPendingAndWaitingForSubgraph = !!(stream as PendingOutgoingStream)
    .hasTransactionSucceeded;
  const isActive = !isPending && currentFlowRate !== "0";
  const menuOpen = Boolean(menuAnchor);
  const pendingCancellation = usePendingStreamCancellation({
    tokenAddress: token,
    senderAddress: sender,
    receiverAddress: receiver,
  });

  const tableCellProps: Partial<TableCellProps> = isPending
    ? {}
    : { onClick: openStreamDetails, sx: { cursor: "pointer" } };

  return (
    <TableRow hover>
      <TableCell {...tableCellProps}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          {isOutgoing ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          <AddressAvatar
            address={isOutgoing ? receiver : sender}
            AvatarProps={{
              sx: { width: "24px", height: "24px", borderRadius: "5px" },
            }}
            BlockiesProps={{ size: 8, scale: 3 }}
          />
          <Typography data-cy={"sender-receiver-address"} variant="h7">
            <AddressName address={isOutgoing ? receiver : sender} />
          </Typography>
        </Stack>
      </TableCell>
      <TableCell {...tableCellProps}>
        <Typography variant="h7mono">
          <FlowingBalance
            balance={streamedUntilUpdatedAt}
            flowRate={isPending ? "0" : currentFlowRate}
            balanceTimestamp={updatedAtTimestamp}
            disableRoundingIndicator
          />
        </Typography>
      </TableCell>
      <TableCell {...tableCellProps}>
        {isActive || isPending ? (
          <Typography data-cy={"flow-rate"} variant="body2mono">
            {isOutgoing ? "-" : "+"}
            <Ether
              wei={BigNumber.from(currentFlowRate).mul(UnitOfTime.Month)}
            />
            /mo
          </Typography>
        ) : (
          <Typography data-cy={"flow-rate"}>{"-"}</Typography>
        )}
      </TableCell>
      <TableCell {...tableCellProps}>
        <Stack
          data-cy={"start-end-date"}
          direction="row"
          alignItems="center"
          gap={1}
        >
          {format(
            (isActive ? createdAtTimestamp : updatedAtTimestamp) * 1000,
            "d MMM. yyyy"
          )}
          {isActive && <AllInclusiveIcon />}
        </Stack>
      </TableCell>
      <TableCell align="center">
        {isPending && (
          <Stack direction="row" alignItems="center" gap={1}>
            <CircularProgress color="warning" size="16px" />
            <Typography variant="caption">
              {isPendingAndWaitingForSubgraph ? "Syncing..." : "Sending..."}
            </Typography>
          </Stack>
        )}
        {isActive && (
          <>
            {flowDeleteMutation.isLoading || !!pendingCancellation ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress color="warning" size="16px" />
                <Typography variant="caption">
                  {pendingCancellation?.hasTransactionSucceeded
                    ? "Syncing..."
                    : "Canceling..."}
                </Typography>
              </Stack>
            ) : (
              <>
                <Tooltip
                  data-cy={"switch-network-tooltip"}
                  arrow
                  title={`Please connect your wallet and switch provider network to ${network.name} in order to cancel the stream.`}
                  disableHoverListener={network.id === activeChain?.id}
                >
                  <span>
                    <Button
                      data-cy={"cancel-button"}
                      color="error"
                      size="small"
                      onClick={openMenu}
                      disabled={network.id !== activeChain?.id}
                    >
                      Cancel
                    </Button>
                  </span>
                </Tooltip>
                <Popover
                  open={menuOpen}
                  anchorEl={menuAnchor}
                  onClose={closeMenu}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuList sx={{ py: 0.5 }}>
                    <MenuItem
                      data-cy={"cancel-stream-button"}
                      onClick={deleteStream}
                    >
                      <ListItemAvatar
                        sx={{ mr: 1, width: "20px", height: "20px" }}
                      >
                        <CloseIcon fontSize="small" color="error" />
                      </ListItemAvatar>
                      <ListItemText
                        primaryTypographyProps={{ variant: "menuItem" }}
                        sx={{ color: "error.main" }}
                      >
                        Cancel Stream
                      </ListItemText>
                    </MenuItem>
                  </MenuList>
                </Popover>
              </>
            )}

            <TransactionDialog
              mutationResult={flowDeleteMutation}
              network={network}
              onClose={closeCancelDialog}
              open={showCancelDialog}
              successActions={
                <TransactionDialogActions>
                  <TransactionDialogButton onClick={closeCancelDialog}>
                    OK
                  </TransactionDialogButton>
                </TransactionDialogActions>
              }
            />
          </>
        )}
      </TableCell>
    </TableRow>
  );
};

export default memo(StreamRow);
