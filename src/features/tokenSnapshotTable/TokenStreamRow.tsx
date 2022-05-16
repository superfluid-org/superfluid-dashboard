import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Avatar,
  Button,
  CircularProgress,
  DialogActions,
  ListItemAvatar,
  ListItemText,
  Menu,
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
import { Address, Stream } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { FC, memo, MouseEvent, useState } from "react";
import shortenAddress from "../../utils/shortenAddress";
import { UnitOfTime } from "../send/FlowRateInput";
import EtherFormatted from "../token/EtherFormatted";
import FlowingBalance from "../token/FlowingBalance";
import Blockies from "react-blockies";
import { rpcApi } from "../redux/store";
import { useNetworkContext } from "../network/NetworkContext";
import CloseIcon from "@mui/icons-material/Close";
import { useWalletContext } from "../wallet/WalletContext";
import { Network } from "../network/networks";
import {
  TransactionDialog,
  TransactionDialogButton,
} from "../transactions/TransactionDialog";

export const TokenStreamRowLoading = () => (
  <TableRow>
    <TableCell sx={{ pl: "72px" }}>
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
    <TableCell>Cancel</TableCell>
  </TableRow>
);

interface TokenStreamRowProps {
  stream: Stream;
  network: Network;
}

const TokenStreamRow: FC<TokenStreamRowProps> = ({ stream, network }) => {
  const {
    sender,
    receiver,
    currentFlowRate,
    streamedUntilUpdatedAt,
    updatedAtTimestamp,
  } = stream;

  const { walletAddress = "", walletChainId } = useWalletContext();

  const [flowDeleteTrigger, flowDeleteMutation] =
    rpcApi.useFlowDeleteMutation();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const openMenu = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const closeMenu = () => setAnchorEl(null);

  const closeCancelDialog = () => setShowCancelDialog(false);

  const deleteStream = () => {
    flowDeleteTrigger({
      chainId: network.chainId,
      receiverAddress: receiver,
      senderAddress: sender,
      superTokenAddress: stream.token,
      userDataBytes: undefined,
      waitForConfirmation: false,
    }).unwrap();
    closeMenu();
    setShowCancelDialog(true);
  };

  const isOutgoing =
    sender.localeCompare(walletAddress, undefined, {
      sensitivity: "accent",
    }) === 0;

  const isActive = currentFlowRate !== "0";
  const menuOpen = Boolean(anchorEl);

  return (
    <TableRow hover>
      <TableCell sx={{ pl: "72px" }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          {isOutgoing ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          <Avatar variant="rounded" sx={{ width: 32, height: 32 }}>
            <Blockies seed={isOutgoing ? receiver : sender} />
          </Avatar>
          <Typography variant="h6">
            {shortenAddress(isOutgoing ? receiver : sender)}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2mono">
          <FlowingBalance
            balance={streamedUntilUpdatedAt}
            flowRate={currentFlowRate}
            balanceTimestamp={updatedAtTimestamp}
            etherDecimalPlaces={currentFlowRate === "0" ? 8 : undefined}
            disableRoundingIndicator
          />
        </Typography>
      </TableCell>
      <TableCell>
        {isActive ? (
          <Typography variant="body2mono">
            {isOutgoing ? "-" : "+"}
            <EtherFormatted
              wei={BigNumber.from(currentFlowRate).mul(UnitOfTime.Month)}
              etherDecimalPlaces={8}
              disableRoundingIndicator
            />
            /mo
          </Typography>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1}>
          {format(updatedAtTimestamp * 1000, "d MMM. yyyy")}
          {isActive && <AllInclusiveIcon />}
        </Stack>
      </TableCell>
      <TableCell align="center">
        {isActive && (
          <>
            {flowDeleteMutation.isLoading ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress color="warning" size="16px" />
                <Typography variant="caption">Pending</Typography>
              </Stack>
            ) : (
              <>
                <Tooltip
                  arrow
                  title={`Please switch provider network to ${network.displayName} in order to cancel the stream.`}
                  disableHoverListener={network.chainId === walletChainId}
                >
                  <span>
                    <Button
                      color="error"
                      size="small"
                      onClick={openMenu}
                      disabled={network.chainId !== walletChainId}
                    >
                      Cancel
                    </Button>
                  </span>
                </Tooltip>
                <Popover
                  open={menuOpen}
                  anchorEl={anchorEl}
                  onClose={closeMenu}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <MenuList sx={{ py: 0.5 }}>
                    <MenuItem onClick={deleteStream}>
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
              onClose={closeCancelDialog}
              open={showCancelDialog}
              successActions={
                <DialogActions sx={{ p: 3, pt: 0 }}>
                  <TransactionDialogButton onClick={closeCancelDialog}>
                    OK
                  </TransactionDialogButton>
                </DialogActions>
              }
            />
          </>
        )}
      </TableCell>
    </TableRow>
  );
};

export default memo(TokenStreamRow);
