import { IconButton, Typography } from "@mui/material";
import { Tooltip } from "chart.js";
import { FC } from "react";
import stream from "stream";
import CancelStreamProgress from "../streamsTable/CancelStreamButton/CancelStreamProgress";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { Network } from "../network/networks";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { vestingSchedulerMutationEndpoints } from "../redux/endpoints/vestingSchedulerEndpoints";
import { rpcApi } from "../redux/store";

interface ExecuteVestingEndButtonProps {
  network: Network;
}

const ExecuteVestingEndButton: FC<ExecuteVestingEndButtonProps> = ({
  network,
}) => {
  const [executeEndTrigger, executeEndMutation] =
    rpcApi.useExecuteEndVestingMutation();

  const getTransactionOverrides = useGetTransactionOverrides();

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

export default ExecuteVestingEndButton;
