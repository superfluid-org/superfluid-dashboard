import { Alert, AlertTitle } from "@mui/material";
import { memo, ReactNode, useMemo } from "react";
import UnknownMutationResult from "../../unknownMutationResult";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";

export default memo(function TransactionDialogErrorAlert({
  mutationError,
}: {
  mutationError: UnknownMutationResult["error"];
}) {
  const { network } = useExpectedNetwork();

  const alertContent = useMemo<ReactNode>(() => {
    if (!mutationError) {
      console.error(
        'Unknown error blocked user from transacting. The error probably got "eaten" by RTK-Query somewhere.'
      );
      return (
        <>
          <AlertTitle>Unknown error</AlertTitle>
          Please refresh the app and try again.
        </>
      );
    } else {
      // NOTE: Sometimes errors are nested in each other. Check for the most specific one first.

      const didUserRejectTransaction =
        mutationError.message?.includes('"code": 4001') || // MetaMask error version
        mutationError.message?.includes("User rejected the transaction") || // WalletConnect error version
        mutationError.message?.includes("Transaction was rejected"); // Gnosis Safe error version
      if (didUserRejectTransaction) {
        return "Transaction Rejected";
      }

      const burnAmountExceedsBalance = mutationError.message?.includes(
        '"execution reverted": "SuperfluidToken: burn amount exceeds balance"'
      );
      if (burnAmountExceedsBalance) {
        return (
          <>
            <AlertTitle>Burn Amount Exceeds Balance</AlertTitle>
            The transaction would put your super token balance into negative.
          </>
        );
      }

      const insufficientFunds = mutationError.message?.includes(
        '"code": "INSUFFICIENT_FUNDS"'
      );
      if (insufficientFunds) {
        return (
          <>
            <AlertTitle>Insufficient Funds</AlertTitle>
            Do you have enough {network.nativeCurrency.symbol} for covering the
            transaction?
          </>
        );
      }

      const unpredictableGasLimit = mutationError.message?.includes(
        '"code": "UNPREDICTABLE_GAS_LIMIT"'
      );
      if (unpredictableGasLimit) {
        return (
          <>
            <AlertTitle>Unpredictable Gas Limit</AlertTitle>
            Could not predict gas for the transaction. Do you have enough{" "}
            {network.nativeCurrency.symbol} for covering the transaction?
          </>
        );
      }

      // Cut out the big nested JSON error object from the message. TODO(KK): Do a better solution but RTK-Query is a dependency.
      return mutationError.message?.split("Caused by:")?.[0];
    }
  }, [mutationError, network]);

  return (
    <Alert severity="error" sx={{ wordBreak: "break-word", width: "100%" }}>
      {alertContent}
    </Alert>
  );
});
