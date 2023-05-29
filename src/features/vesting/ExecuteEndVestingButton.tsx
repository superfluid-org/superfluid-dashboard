import { LoadingButton } from "@mui/lab";
import { Typography } from "@mui/material";
import { Overrides, Signer } from "ethers";
import { FC } from "react";
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
  disabled?: boolean;
}

const ExecuteEndVestingButton: FC<ExecuteEndVestingButtonProps> = ({
  vestingSchedule,
  network,
  disabled,
}) => {
  const { txAnalytics } = useAnalytics();

  const pendingEndExecution = usePendingVestingEndExecution({
    chainId: network.id,
    receiverAddress: vestingSchedule.receiver,
    senderAddress: vestingSchedule.sender,
    superTokenAddress: vestingSchedule.superToken,
  });

  const [executeEndVestingTrigger, executeEndVestingResult] =
    rpcApi.useExecuteEndVestingMutation();

  const executeVestingEnd = async (
    signer: Signer,
    getOverrides: () => Promise<Overrides>
  ) => {
    const primaryArgs = {
      superTokenAddress: vestingSchedule.superToken,
      senderAddress: vestingSchedule.sender,
      receiverAddress: vestingSchedule.receiver,
      chainId: network.id,
    };

    executeEndVestingTrigger({
      ...primaryArgs,
      signer,
      overrides: await getOverrides(),
    })
      .unwrap()
      .then(...txAnalytics("Execute Vesting End", primaryArgs))
      .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
  };

  return (
    <ConnectionBoundary expectedNetwork={network}>
      {({ isConnected, isCorrectNetwork }) => (
        <TransactionBoundary mutationResult={executeEndVestingResult}>
          {({ mutationResult, signer, setDialogLoadingInfo, getOverrides }) => (
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
                executeVestingEnd(signer, getOverrides);
              }}
              disabled={
                disabled || !(isConnected && signer && isCorrectNetwork)
              }
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
