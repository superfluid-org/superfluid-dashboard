import { ButtonProps, Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { constants } from "ethers";
import { FC, memo } from "react";
import { useSimulateContract, useWalletClient } from "wagmi";
import { useSuperfluidWriteContract } from "../../transactions/useSuperfluidWriteContract";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { erc20Abi } from "../../../generated";
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
}> = ({ token, isVisible, ButtonProps = {}, ConnectionBoundaryButtonProps, network, ...props }) => {
  const { data: walletClient } = useWalletClient();

  const primaryArgs = {
    spender: network.autoWrap!.strategyContractAddress,
    amount: BigInt(constants.Zero.toString()),
  };
  const prepare = !props.isDisabled && network.autoWrap && walletClient && walletClient.chain.id === network.id;
  const { data: config } = useSimulateContract(
    prepare
      ? {
          abi: erc20Abi,
          functionName: "approve",
          address: token.underlyingAddress as `0x${string}`,
          chainId: network.id,
          args: [primaryArgs.spender, primaryArgs.amount],
          // TODO: overrides
        }
      : undefined
  );

  const { write, result: mutationResult } = useSuperfluidWriteContract();

  const underlyingTokenQuery = useTokenQuery({
    chainId: network.id,
    id: token.underlyingAddress!, // TODO: get rid of bang?
  });
  const underlyingToken = underlyingTokenQuery.data;

  const isButtonEnabled = prepare && config && config.request;
  const isButtonDisabled = !isButtonEnabled;

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

              write({
                chainId: network.id,
                abi: erc20Abi,
                address: token.underlyingAddress as `0x${string}`,
                functionName: "approve",
                args: [primaryArgs.spender, primaryArgs.amount],
                title: "Disable Auto-Wrap",
              })
                .then(
                  ...txAnalytics("Disable Auto-Wrap", primaryArgs)
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
