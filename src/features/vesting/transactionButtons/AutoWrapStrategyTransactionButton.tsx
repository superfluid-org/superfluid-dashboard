import { Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { FC, memo } from "react";
import { useEnableAutoWrap } from "../../auto-wrap/useAutoWrapWrites";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { Network } from "../../network/networks";
import { SuperTokenMinimal } from "../../redux/endpoints/tokenTypes";

const TX_TITLE: TransactionTitle = "Enable Auto-Wrap";

const AutoWrapStrategyTransactionButton: FC<{
  token: SuperTokenMinimal;
  isVisible: boolean;
  isDisabled: boolean;
  network: Network;
}> = ({ token, isVisible, network, isDisabled }) => {
  const [enableAutoWrap, mutationResult] = useEnableAutoWrap();

  const isButtonDisabled =
    isDisabled || !network.autoWrap || !token.underlyingAddress;

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({ setDialogLoadingInfo, txAnalytics }) =>
        isVisible && (
          <TransactionButton
            dataCy="enable-auto-wrap-button"
            disabled={isButtonDisabled}
            onClick={async () => {
              if (isButtonDisabled)
                throw new Error("This should never happen!");
              setDialogLoadingInfo(
                <Typography data-cy="auto-wrap-tx-message" variant="h5" color="text.secondary" translate="yes">
                  You are enabling Auto-Wrap to top up your {token.symbol}{" "}
                  tokens when balance reaches low.
                </Typography>
              );

              enableAutoWrap({
                chainId: network.id,
                superTokenAddress: token.address,
                underlyingTokenAddress: token.underlyingAddress!,
                simulate: true,
              })
                .then(
                  ...txAnalytics("Enable Auto-Wrap", {
                    superToken: token.address,
                    liquidityToken: token.underlyingAddress,
                  })
                )
                .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
            }}
          >
            {TX_TITLE}
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};

export default memo(AutoWrapStrategyTransactionButton);
