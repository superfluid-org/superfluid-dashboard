import { LoadingButton } from "@mui/lab";
import { Typography } from "@mui/material";
import { Signer } from "ethers";
import { FC } from "react";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { useAnalytics } from "../analytics/useAnalytics";
import { Network } from "../network/networks";
import { usePendingVestingCliffExecution } from "../pendingUpdates/PendingVestingExecution";
import { rpcApi } from "../redux/store";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { VestingSchedule } from "./types";

interface ExecuteVestingCliffAndFlowButtonProps {
  vestingSchedule: VestingSchedule;
  network: Network;
}

const ExecuteVestingCliffAndFlowButton: FC<
  ExecuteVestingCliffAndFlowButtonProps
> = ({ vestingSchedule, network }) => {
  const { txAnalytics } = useAnalytics();
  const getTransactionOverrides = useGetTransactionOverrides();

  const pendingCliffExecution = usePendingVestingCliffExecution({
    chainId: network.id,
    receiverAddress: vestingSchedule.receiver,
    senderAddress: vestingSchedule.sender,
    superTokenAddress: vestingSchedule.superToken,
  });

  const [executeVestingCliffAndFlowTrigger, executeVestingCliffAndFlowResult] =
    rpcApi.useExecuteCliffAndFlowMutation();

  const executeCliffAndFlow = async (signer: Signer) => {
    const primaryArgs = {
      superTokenAddress: vestingSchedule.superToken,
      senderAddress: vestingSchedule.sender,
      receiverAddress: vestingSchedule.receiver,
      chainId: network.id,
    };

    executeVestingCliffAndFlowTrigger({
      ...primaryArgs,
      signer,
      waitForConfirmation: false,
      overrides: await getTransactionOverrides(network),
    })
      .unwrap()
      .then(...txAnalytics("Execute Vesting Cliff And Flow", primaryArgs))
      .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
  };

  return (
    <ConnectionBoundary expectedNetwork={network}>
      {({ isConnected, isCorrectNetwork }) => (
        <TransactionBoundary mutationResult={executeVestingCliffAndFlowResult}>
          {({ mutationResult, signer, setDialogLoadingInfo }) => (
            <LoadingButton
              loading={!!pendingCliffExecution || mutationResult.isLoading}
              fullWidth
              color="primary"
              variant="contained"
              onClick={() => {
                if (!signer) {
                  throw new Error("Signer should always be present here.");
                }

                setDialogLoadingInfo(
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    translate="yes"
                  >
                    You are executing cliff and stream.
                  </Typography>
                );
                executeCliffAndFlow(signer);
              }}
              disabled={!(isConnected && signer && isCorrectNetwork)}
            >
              Execute
            </LoadingButton>
          )}
        </TransactionBoundary>
      )}
    </ConnectionBoundary>
  );
};

export default ExecuteVestingCliffAndFlowButton;
