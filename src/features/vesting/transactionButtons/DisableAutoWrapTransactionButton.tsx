import { ButtonProps, Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { FC, memo } from "react";
import { useDisableAutoWrap } from "../../auto-wrap/useAutoWrapWrites";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { Network } from "../../network/networks";
import { ConnectionBoundaryButtonProps } from "../../transactionBoundary/ConnectionBoundaryButton";
import { SuperTokenMinimal } from "../../redux/endpoints/tokenTypes";
import { useTokenQuery } from "../../../hooks/useTokenQuery";

const TX_TITLE: TransactionTitle = "Disable Auto-Wrap";

const DisableAutoWrapTransactionButton: FC<{
  token: SuperTokenMinimal;
  isVisible: boolean;
  isDisabled: boolean;
  ButtonProps?: ButtonProps;
  network: Network;
  ConnectionBoundaryButtonProps?: Partial<ConnectionBoundaryButtonProps>
}> = ({ token, isVisible, ButtonProps = {}, ConnectionBoundaryButtonProps, network, isDisabled }) => {
  const [disableAutoWrap, mutationResult] = useDisableAutoWrap();

  const underlyingTokenQuery = useTokenQuery({
    chainId: network.id,
    id: token.underlyingAddress!, // TODO: get rid of bang?
  });
  const underlyingToken = underlyingTokenQuery.data;

  const isButtonDisabled =
    isDisabled || !network.autoWrap || !token.underlyingAddress;

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({ network, setDialogLoadingInfo, txAnalytics }) =>
        isVisible && (
          <TransactionButton
            dataCy="disable-auto-wrap-button"
            ConnectionBoundaryButtonProps={{
              impersonationTitle: "Stop viewing",
              changeNetworkTitle: "Change Network",
              ...ConnectionBoundaryButtonProps,
            }}
            disabled={isButtonDisabled}
            ButtonProps={{
              size: "medium",
              ...ButtonProps,
            }}
            onClick={async () => {
              if (isButtonDisabled)
                throw new Error("This should never happen!");

              setDialogLoadingInfo(
                <Typography variant="h5" color="text.secondary" translate="yes">
                  You are revoking Auto-Wrap token allowance for the underlying{" "}
                  {underlyingToken && underlyingToken.symbol} token.
                </Typography>
              );

              disableAutoWrap({
                chainId: network.id,
                underlyingTokenAddress: token.underlyingAddress!,
                simulate: true,
              })
                .then(
                  ...txAnalytics("Disable Auto-Wrap", {
                    spender: network.autoWrap?.strategyContractAddress,
                  })
                )
                .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
            }}
          >
            Disable
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};

export default memo(DisableAutoWrapTransactionButton);
