import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  IconButton,
  IconButtonProps,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  MenuList,
  Popover,
  Tooltip,
} from "@mui/material";
import { Stream } from "@superfluid-finance/sdk-core";
import { FC, MouseEvent, useState } from "react";
import { useNetwork, useSigner } from "wagmi";
import useGetTransactionOverrides from "../../../hooks/useGetTransactionOverrides";
import { Network } from "../../network/networks";
import usePendingStreamCancellation from "../../pendingUpdates/usePendingStreamCancellation";
import { rpcApi } from "../../redux/store";
import {
  TransactionDialog,
  TransactionDialogActions,
  TransactionDialogButton,
} from "../../transactions/TransactionDialog";
import CancelStreamProgress from "./CancelStreamProgress";

interface CancelStreamButtonProps {
  stream: Stream;
  network: Network;
  IconButtonProps?: Partial<IconButtonProps>;
}

const CancelStreamButton: FC<CancelStreamButtonProps> = ({
  stream,
  network,
  IconButtonProps = {},
}) => {
  const { token, sender, receiver } = stream;

  const { chain: activeChain } = useNetwork();
  const { data: signer } = useSigner();
  const [flowDeleteTrigger, flowDeleteMutation] =
    rpcApi.useFlowDeleteMutation();
  const getTransactionOverrides = useGetTransactionOverrides();

  const pendingCancellation = usePendingStreamCancellation({
    tokenAddress: token,
    senderAddress: sender,
    receiverAddress: receiver,
  });

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const openMenu = (event: MouseEvent<HTMLButtonElement>) =>
    setMenuAnchor(event.currentTarget);
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

  const menuOpen = Boolean(menuAnchor);

  return (
    <>
      {flowDeleteMutation.isLoading || !!pendingCancellation ? (
        <CancelStreamProgress pendingCancellation={pendingCancellation} />
      ) : (
        <>
          <Tooltip
            data-cy={"switch-network-tooltip"}
            arrow
            disableInteractive
            title={`Please connect your wallet and switch provider network to ${network.name} in order to cancel the stream.`}
            disableHoverListener={network.id === activeChain?.id}
          >
            <span>
              <IconButton
                data-cy={"cancel-button"}
                color="error"
                size="small"
                onClick={openMenu}
                disabled={network.id !== activeChain?.id}
                {...IconButtonProps}
              >
                <CancelRoundedIcon />
              </IconButton>
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
                <ListItemAvatar sx={{ mr: 1, width: "20px", height: "20px" }}>
                  <CloseRoundedIcon fontSize="small" color="error" />
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
  );
};

export default CancelStreamButton;
