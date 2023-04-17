import { LoadingButton } from "@mui/lab";
import { Typography } from "@mui/material";
import { Signer } from "ethers";
import { FC } from "react";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { useAnalytics } from "../analytics/useAnalytics";
import { Network } from "../network/networks";
import { usePendingVestingEndExecution } from "../pendingUpdates/PendingVestingExecution";
import { rpcApi } from "../redux/store";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { VestingSchedule } from "./types";

interface ExecuteEndVestingButtonProps {
  vestingSchedule: VestingSchedule;
  network: Network;
}

const ExecuteEndVestingButton: FC<ExecuteEndVestingButtonProps> = ({
  vestingSchedule,
  network,
}) => {
  const { txAnalytics } = useAnalytics();
  const getTransactionOverrides = useGetTransactionOverrides();

  const pendingEndExecution = usePendingVestingEndExecution({
    chainId: network.id,
    receiverAddress: vestingSchedule.receiver,
    senderAddress: vestingSchedule.sender,
    superTokenAddress: vestingSchedule.superToken,
  });

  const [executeEndVestingTrigger, executeEndVestingResult] =
    rpcApi.useExecuteEndVestingMutation();

  const executeVestingEnd = async (signer: Signer) => {
    const primaryArgs = {
      superTokenAddress: vestingSchedule.superToken,
      senderAddress: vestingSchedule.sender,
      receiverAddress: vestingSchedule.receiver,
      chainId: network.id,
    };

    executeEndVestingTrigger({
      ...primaryArgs,
      signer,
      waitForConfirmation: false,
      overrides: await getTransactionOverrides(network),
    })
      .unwrap()
      .then(...txAnalytics("Execute Vesting End", primaryArgs))
      .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
  };

  return (
    <ConnectionBoundary expectedNetwork={network}>
      {({ isConnected, isCorrectNetwork }) => (
        <TransactionBoundary mutationResult={executeEndVestingResult}>
          {({ mutationResult, signer, setDialogLoadingInfo }) => (
            <LoadingButton
              loading={!!pendingEndExecution || mutationResult.isLoading}
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
                    You are executing vesting end.
                  </Typography>
                );
                executeVestingEnd(signer);
              }}
              disabled={!(isConnected && signer && isCorrectNetwork)}
            >
              End
            </LoadingButton>
          )}
        </TransactionBoundary>
      )}
    </ConnectionBoundary>
  );
};

export default ExecuteEndVestingButton;
