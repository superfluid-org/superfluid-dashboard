import { Alert, AlertTitle } from "@mui/material";
import { memo, ReactNode, useMemo } from "react";
import MutationResult from "../../MutationResult";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";

export default memo(function TransactionDialogErrorAlert({
  mutationError,
}: {
  mutationError: MutationResult["error"];
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
      // Primary signal is the viem-aware `code` set by `classifyError` in the write executor
      // (USER_REJECTED / INSUFFICIENT_FUNDS / CONTRACT_REVERT). Message checks remain only as a
      // fallback for paths that don't carry a code (e.g. the auto-wrap permission flow, or a
      // Cypress-injected error string).
      const errorMessageLowerCase = mutationError.message?.toLowerCase() ?? "";

      const didUserRejectTransaction =
        mutationError.code === "USER_REJECTED" ||
        // viem's UserRejectedRequestError short message is "User rejected the request."
        (errorMessageLowerCase.includes("rejected") &&
          errorMessageLowerCase.includes("request")) ||
        // Auto-wrap permission + Cypress
        errorMessageLowerCase.includes("denied transaction signature");
      if (didUserRejectTransaction) {
        return "Transaction Rejected";
      }

      const burnAmountExceedsBalance = mutationError.message?.includes(
        "burn amount exceeds balance"
      );
      if (burnAmountExceedsBalance) {
        return (
          <>
            <AlertTitle>Burn Amount Exceeds Balance</AlertTitle>
            The transaction would put your super token balance into negative.
          </>
        );
      }

      const insufficientFunds =
        mutationError.code === "INSUFFICIENT_FUNDS" ||
        errorMessageLowerCase.includes("insufficient funds");
      if (insufficientFunds) {
        return (
          <>
            <AlertTitle>Insufficient Funds</AlertTitle>
            Do you have enough {network.nativeCurrency.symbol} for covering the
            transaction?
          </>
        );
      }

      // Cut out the big nested JSON error object from the message. TODO(KK): Do a better solution but RTK-Query is a dependency.
      return mutationError.message?.split("Caused by:")?.[0];
    }
  }, [mutationError, network]);

  return (
    <Alert data-cy={"tx-error"} severity="error" sx={{ wordBreak: "break-word", width: "100%" }}>
      {alertContent}
    </Alert>
  );
});
