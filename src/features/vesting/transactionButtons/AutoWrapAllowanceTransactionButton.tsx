import { Typography } from "@mui/material";
import { FC, memo } from "react";
import { useApproveAutoWrapAllowance } from "../../auto-wrap/useAutoWrapWrites";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { Network } from "../../network/networks";
import { SuperTokenMinimal } from "../../redux/endpoints/tokenTypes";
import { useTokenQuery } from "../../../hooks/useTokenQuery";

const AutoWrapAllowanceTransactionButton: FC<{
  token: SuperTokenMinimal;
  isVisible: boolean;
  isDisabled: boolean;
  network: Network;
}> = ({ token, isVisible, network, isDisabled }) => {
  const [approveAllowance, mutationResult] = useApproveAutoWrapAllowance();

  const underlyingTokenQuery = useTokenQuery({
    chainId: network.id,
    id: token.underlyingAddress!, // TODO: Get rid of the bang
  });
  const underlyingToken = underlyingTokenQuery.data;

  const isButtonDisabled =
    isDisabled || !network.autoWrap || !token.underlyingAddress;

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({ setDialogLoadingInfo, txAnalytics }) =>
        isVisible && (
          <TransactionButton
            dataCy="auto-wrap-allowance-button"
            disabled={isButtonDisabled}
            onClick={async () => {
              if (isButtonDisabled)
                throw new Error("This should never happen!");
              setDialogLoadingInfo(
                <Typography data-cy="auto-wrap-allowance-tx-message" variant="h5" color="text.secondary" translate="yes">
                  You are approving Auto-Wrap token allowance for the underlying
                  token.
                </Typography>
              );

              approveAllowance({
                chainId: network.id,
                underlyingTokenAddress: token.underlyingAddress!,
                simulate: true,
              })
                .then(
                  ...txAnalytics("Approve Auto-Wrap Allowance", {
                    spender: network.autoWrap?.strategyContractAddress,
                  })
                )
                .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
            }}
          >
            Approve {underlyingToken && underlyingToken.symbol} Allowance
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};

export default memo(AutoWrapAllowanceTransactionButton);
