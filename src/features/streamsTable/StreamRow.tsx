import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import {
  Avatar,
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
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { Stream } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { FC, memo, MouseEvent, useState } from "react";
import Blockies from "react-blockies";
import { useNetwork } from "wagmi";
import shortenAddress from "../../utils/shortenAddress";
import { Network } from "../network/networks";
import { rpcApi } from "../redux/store";
import { UnitOfTime } from "../send/FlowRateInput";
import EtherFormatted from "../token/EtherFormatted";
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
  stream: Stream;
  network: Network;
}

const StreamRow: FC<StreamRowProps> = ({ stream, network }) => {
  const {
    id,
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

  const deleteStream = () => {
    flowDeleteTrigger({
      chainId: network.id,
      receiverAddress: receiver,
      senderAddress: sender,
      superTokenAddress: stream.token,
      userDataBytes: undefined,
      waitForConfirmation: false,
    }).unwrap();
    closeMenu();
    setShowCancelDialog(true);
  };

  const isOutgoing = visibleAddress?.toLowerCase() === sender.toLowerCase();

  const isActive = currentFlowRate !== "0";
  const menuOpen = Boolean(menuAnchor);

  return (
    <TableRow hover>
      <TableCell onClick={openStreamDetails} sx={{ cursor: "pointer" }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          {isOutgoing ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          <Avatar variant="rounded">
            <Blockies
              seed={isOutgoing ? receiver : sender}
              size={12}
              scale={3}
            />
          </Avatar>
          <Typography data-cy={"sender-receiver-address"} variant="h6">
            {shortenAddress(isOutgoing ? receiver : sender)}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell onClick={openStreamDetails} sx={{ cursor: "pointer" }}>
        <Typography variant="h7mono">
          <FlowingBalance
            balance={streamedUntilUpdatedAt}
            flowRate={currentFlowRate}
            balanceTimestamp={updatedAtTimestamp}
            etherDecimalPlaces={currentFlowRate === "0" ? 8 : undefined}
            disableRoundingIndicator
          />
        </Typography>
      </TableCell>
      <TableCell onClick={openStreamDetails} sx={{ cursor: "pointer" }}>
        {isActive ? (
          <Typography data-cy={"flow-rate"} variant="body2mono">
            {isOutgoing ? "-" : "+"}
            <EtherFormatted
              wei={BigNumber.from(currentFlowRate).mul(UnitOfTime.Month)}
              etherDecimalPlaces={8}
              disableRoundingIndicator
            />
            /mo
          </Typography>
        ) : (
            <Typography data-cy={"flow-rate"}>{"-"}</Typography>
        )}
      </TableCell>
      <TableCell onClick={openStreamDetails} sx={{ cursor: "pointer" }}>
        <Stack data-cy={"start-end-date"} direction="row" alignItems="center" gap={1}>
          {format(
            (isActive ? createdAtTimestamp : updatedAtTimestamp) * 1000,
            "d MMM. yyyy"
          )}
          {isActive && <AllInclusiveIcon />}
        </Stack>
      </TableCell>
      <TableCell align="center">
        {isActive && flowDeleteTransaction?.status !== "Succeeded" && (
          <>
            {flowDeleteMutation.isLoading ||
            flowDeleteTransaction?.status === "Pending" ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress color="warning" size="16px" />
                <Typography variant="caption">Pending</Typography>
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
                    <MenuItem data-cy={"cancel-stream-button"} onClick={deleteStream}>
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
