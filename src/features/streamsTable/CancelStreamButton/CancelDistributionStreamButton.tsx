import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import {
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
  Typography,
} from "@mui/material";
import { FC, useMemo } from "react";
import { useAccount } from "@/hooks/useAccount"
import useGetTransactionOverrides from "../../../hooks/useGetTransactionOverrides";
import { ethersOverridesToViem } from "../../../utils/ethersOverridesToViem";
import { useAnalytics } from "../../analytics/useAnalytics";
import { Network } from "../../network/networks";
import { usePendingStreamCancellation } from "../../pendingUpdates/PendingStreamCancellation";
import { useCancelDistributionStream } from "../../pool/useDistributionWrites";
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
    useCancelDistributionStream();

  const getTransactionOverrides = useGetTransactionOverrides();
  const pendingCancellation = usePendingStreamCancellation({
    tokenAddress: token,
    senderAddress: sender,
    receiverAddress: receiver,
  });

  const { txAnalytics } = useAnalytics();

  const cancelDistributionStream = async () => {
    const primaryArgs = {
      chainId: network.id,
      superTokenAddress: stream.token,
      senderAddress: sender,
      poolAddress: stream.pool
    };
    cancelDistributionStream_({
      ...primaryArgs,
      overrides: ethersOverridesToViem(await getTransactionOverrides(network)),
    })
      .then(...txAnalytics("Cancel Distribution Stream", primaryArgs))
      .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
  };

  const isSender = useMemo(() => {
    if (!accountAddress) {
      return false;
    }
    return sender.toLowerCase() === accountAddress.toLowerCase();
  }, [accountAddress, sender]);

  if (!isSender) return null;

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
                        setDialogLoadingInfo(
                          <Typography
                            variant="h5"
                            color="text.secondary"
                            translate="yes"
                          >
                            You are canceling an outgoing distribution stream.
                          </Typography>
                        );

                        cancelDistributionStream();
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
