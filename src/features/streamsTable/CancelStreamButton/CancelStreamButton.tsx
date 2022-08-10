import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
} from "@mui/material";
import { Stream } from "@superfluid-finance/sdk-core";
import { FC, useState } from "react";
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
  TooltipProps?: Partial<TooltipProps>;
}

const CancelStreamButton: FC<CancelStreamButtonProps> = ({
  stream,
  network,
  IconButtonProps = {},
  TooltipProps = {},
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

  const [showCancelDialog, setShowCancelDialog] = useState(false);

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

    setShowCancelDialog(true);
  };

  return (
    <>
      {flowDeleteMutation.isLoading || !!pendingCancellation ? (
        <CancelStreamProgress pendingCancellation={pendingCancellation} />
      ) : (
        <>
          <Tooltip
            data-cy={"switch-network-tooltip"}
            placement="top"
            arrow
            disableInteractive
            title={
              network.id === activeChain?.id
                ? "Cancel Stream"
                : `Please connect your wallet and switch provider network to ${network.name} in order to cancel the stream.`
            }
            // disableHoverListener={network.id === activeChain?.id}
            {...TooltipProps}
          >
            <span>
              <IconButton
                data-cy={"cancel-button"}
                color="error"
                onClick={deleteStream}
                disabled={network.id !== activeChain?.id}
                {...IconButtonProps}
              >
                <CancelRoundedIcon />
              </IconButton>
            </span>
          </Tooltip>
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
