import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
  Typography,
} from "@mui/material";
import { Stream } from "@superfluid-finance/sdk-core";
import { Signer } from "ethers";
import { FC } from "react";
import useGetTransactionOverrides from "../../../hooks/useGetTransactionOverrides";
import { Network } from "../../network/networks";
import { usePendingStreamCancellation } from "../../pendingUpdates/PendingStreamCancellation";
import { rpcApi } from "../../redux/store";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
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
  const [flowDeleteTrigger, flowDeleteMutation] =
    rpcApi.useFlowDeleteMutation();
  const getTransactionOverrides = useGetTransactionOverrides();
  const pendingCancellation = usePendingStreamCancellation({
    tokenAddress: token,
    senderAddress: sender,
    receiverAddress: receiver,
  });

  const deleteStream = async (signer: Signer) => {
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
  };

  return (
    <ConnectionBoundary expectedNetwork={network}>
      {({ isConnected, isCorrectNetwork }) => (
        <TransactionBoundary mutationResult={flowDeleteMutation}>
          {({ mutationResult, signer, setDialogLoadingInfo }) =>
            mutationResult.isLoading || !!pendingCancellation ? (
              <CancelStreamProgress pendingCancellation={pendingCancellation} />
            ) : (
              <>
                <Tooltip
                  data-cy={"switch-network-tooltip"}
                  placement="top"
                  arrow
                  disableInteractive
                  title={
                    !isConnected
                      ? "Connect wallet to cancel stream"
                      : !isCorrectNetwork
                      ? `Switch network to ${network.name} to cancel stream`
                      : "Cancel stream"
                  }
                  {...TooltipProps}
                >
                  <span>
                    <IconButton
                      data-cy={"cancel-button"}
                      color="error"
                      onClick={() => {
                        if (!signer)
                          throw new Error(
                            "Signer should always be present here."
                          );
                        setDialogLoadingInfo(
                          <Typography
                            variant="h5"
                            color="text.secondary"
                            translate="yes"
                          >
                            You are canceling a stream.
                          </Typography>
                        );
                        deleteStream(signer);
                      }}
                      disabled={!(isConnected && signer && isCorrectNetwork)}
                      {...IconButtonProps}
                    >
                      <CancelRoundedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )
          }
        </TransactionBoundary>
      )}
    </ConnectionBoundary>
  );
};

export default CancelStreamButton;
