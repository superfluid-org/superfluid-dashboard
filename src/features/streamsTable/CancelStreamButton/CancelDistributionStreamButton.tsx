import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
  Typography,
} from "@mui/material";
import { Signer } from "ethers";
import { FC, useMemo } from "react";
import { useAccount } from "wagmi";
import useGetTransactionOverrides from "../../../hooks/useGetTransactionOverrides";
import { useAnalytics } from "../../analytics/useAnalytics";
import { Network } from "../../network/networks";
import { usePendingStreamCancellation } from "../../pendingUpdates/PendingStreamCancellation";
import { rpcApi } from "../../redux/store";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import CancelStreamProgress from "./CancelStreamProgress";
import { PoolDistributionStream } from "../StreamsTable";

interface CancelDistributionStreamButtonProps {
  stream: PoolDistributionStream;
  network: Network;
  IconButtonProps?: Partial<IconButtonProps>;
  TooltipProps?: Partial<TooltipProps>;
}

const CancelDistributionStreamButton: FC<CancelDistributionStreamButtonProps> = ({
  stream,
  network,
  IconButtonProps = {},
  TooltipProps = {},
}) => {
  const { address: accountAddress } = useAccount();

  const { token, sender, receiver } = stream;
  const [cancelDistributionStream_, distributionStreamCancellationMutation] =
    rpcApi.useCancelDistributionStreamMutation();

  const getTransactionOverrides = useGetTransactionOverrides();
  const pendingCancellation = usePendingStreamCancellation({
    tokenAddress: token,
    senderAddress: sender,
    receiverAddress: receiver,
  });

  const { txAnalytics } = useAnalytics();

  const cancelDistributionStream = async (signer: Signer) => {
    const primaryArgs = {
      chainId: network.id,
      superTokenAddress: stream.token,
      senderAddress: sender,
      poolAddress: stream.pool
    };
    cancelDistributionStream_({
      ...primaryArgs,
      signer,
      overrides: await getTransactionOverrides(network),
    })
      .unwrap()
      .then(...txAnalytics("Cancel Distribution Stream", primaryArgs))
      .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
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
        <TransactionBoundary mutationResult={distributionStreamCancellationMutation}>
          {({ mutationResult, signer, setDialogLoadingInfo }) =>
            mutationResult.isLoading || !!pendingCancellation ? (
              <CancelStreamProgress
                isSchedule={false}
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
                      ? "Connect wallet to cancel distribution stream"
                      : !isCorrectNetwork
                        ? `Switch network to ${network.name} to cancel distribution stream`
                        : "Cancel distribution stream"
                  }
                  {...TooltipProps}
                >
                  <span>
                    <IconButton
                      data-cy={"cancel-button"}
                      color="error"
                      onClick={async () => {
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
                            You are canceling an outgoing distribution stream.
                          </Typography>
                        );

                        cancelDistributionStream(signer);
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

export default CancelDistributionStreamButton;
