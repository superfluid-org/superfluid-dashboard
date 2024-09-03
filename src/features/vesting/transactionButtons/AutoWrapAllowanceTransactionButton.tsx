import { Typography } from "@mui/material";
import { constants } from "ethers";
import { FC, memo } from "react";
import { useSimulateContract, useWalletClient } from "wagmi";
import { rpcApi } from "../../redux/store";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { erc20Abi } from "../../../generated";
import { Network } from "../../network/networks";
import { SuperTokenMinimal } from "../../redux/endpoints/tokenTypes";
import { useTokenQuery } from "../../../hooks/useTokenQuery";

const AutoWrapAllowanceTransactionButton: FC<{
  token: SuperTokenMinimal;
  isVisible: boolean;
  isDisabled: boolean;
  network: Network;
}> = ({ token, isVisible, network, ...props }) => {
  const { data: walletClient } = useWalletClient();

  const primaryArgs = {
    spender: network.autoWrap!.strategyContractAddress,
    amount: BigInt(constants.MaxUint256.toString()),
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
      }
      : undefined
  );

  const [write, mutationResult] = rpcApi.useWriteContractMutation();

  const underlyingTokenQuery = useTokenQuery({
    chainId: network.id,
    id: token.underlyingAddress!, // TODO: Get rid of the bang
  });
  const underlyingToken = underlyingTokenQuery.data;

  const isButtonEnabled = prepare && config && config.request;
  const isButtonDisabled = !isButtonEnabled;

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({ setDialogLoadingInfo, txAnalytics }) =>
        isVisible && (
          <TransactionButton
            dataCy="auto-wrap-allowance-button"
            disabled={isButtonDisabled}
            onClick={async (signer) => {
              if (isButtonDisabled)
                throw new Error("This should never happen!");
              setDialogLoadingInfo(
                <Typography data-cy="auto-wrap-allowance-tx-message" variant="h5" color="text.secondary" translate="yes">
                  You are approving Auto-Wrap token allowance for the underlying
                  token.
                </Typography>
              );

              write({
                signer,
                request: {
                  ...config.request,
                  chainId: network.id,
                },
                transactionTitle: "Approve Allowance",
              })
                .unwrap()
                .then(
                  ...txAnalytics("Approve Auto-Wrap Allowance", primaryArgs)
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
