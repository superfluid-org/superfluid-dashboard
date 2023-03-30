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
import { FC, useMemo } from "react";
import { useAccount } from "wagmi";
import { ScheduledStream } from "../../../hooks/streamSchedulingHooks";
import useGetTransactionOverrides from "../../../hooks/useGetTransactionOverrides";
import { useAnalytics } from "../../analytics/useAnalytics";
import { Network } from "../../network/networks";
import { usePendingStreamCancellation } from "../../pendingUpdates/PendingStreamCancellation";
import { rpcApi } from "../../redux/store";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { StreamScheduling } from "../StreamScheduling";
import CancelStreamProgress from "./CancelStreamProgress";

interface CancelStreamButtonProps {
  stream: (Stream | ScheduledStream) & StreamScheduling;
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
  const { address: accountAddress } = useAccount();

  const { token, sender, receiver } = stream;
  const [flowDeleteTrigger, flowDeleteMutation] =
    rpcApi.useDeleteFlowWithSchedulingMutation();

  const getTransactionOverrides = useGetTransactionOverrides();
  const pendingCancellation = usePendingStreamCancellation({
    tokenAddress: token,
    senderAddress: sender,
    receiverAddress: receiver,
  });

  const { txAnalytics } = useAnalytics();

  const deleteStream = async (signer: Signer) => {
    const primaryArgs = {
      chainId: network.id,
      superTokenAddress: stream.token,
      senderAddress: sender,
      receiverAddress: receiver,
      userDataBytes: undefined,
    };
    flowDeleteTrigger({
      ...primaryArgs,
      signer,
      waitForConfirmation: false,
      overrides: await getTransactionOverrides(network),
    })
      .unwrap()
      .then(...txAnalytics("Cancel Stream", primaryArgs))
      .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
  };

  const isSenderOrReceiverLooking = useMemo(
    () =>
      accountAddress &&
      (sender.toLowerCase() === accountAddress.toLowerCase() ||
        receiver.toLowerCase() === accountAddress.toLowerCase()),
    [accountAddress, sender, receiver]
  );

  if (!isSenderOrReceiverLooking) return null;

  return (
    <ConnectionBoundary expectedNetwork={network}>
      {({ isConnected, isCorrectNetwork }) => (
        <TransactionBoundary mutationResult={flowDeleteMutation}>
          {({ mutationResult, signer, setDialogLoadingInfo }) =>
            mutationResult.isLoading || !!pendingCancellation ? (
              <CancelStreamProgress
                isSchedule={!!stream.startDateScheduled}
                pendingCancellation={pendingCancellation}
              />
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
