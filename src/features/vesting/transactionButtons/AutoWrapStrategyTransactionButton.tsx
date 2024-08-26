import { Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { BigNumber } from "ethers";
import { FC, memo } from "react";
import { useSimulateContract, useWalletClient  } from "wagmi";
import { autoWrapManagerAbi, autoWrapManagerAddress } from "../../../generated";
import { rpcApi } from "../../redux/store";
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
}> = ({ token, isVisible, network, ...props }) => {
  const { data: walletClient } = useWalletClient();

  const primaryArgs = {
    superToken: token.address as `0x${string}`,
    strategy: network.autoWrap!.strategyContractAddress,
    liquidityToken: token.underlyingAddress as `0x${string}`,
    expiry: BigInt(BigNumber.from("3000000000").toString()),
    lowerLimit: BigInt(BigNumber.from(network.autoWrap!.lowerLimit).toString()),
    upperLimit: BigInt(BigNumber.from(network.autoWrap!.upperLimit).toString()),
  };

  const prepare = !props.isDisabled && network.autoWrap && walletClient && walletClient.chain.id === network.id;;
  const { data: config } = useSimulateContract(
    prepare
      ? {
          abi: autoWrapManagerAbi,
          functionName: "createWrapSchedule",
          address: network.autoWrap!.managerContractAddress,
          args: [
            primaryArgs.superToken,
            primaryArgs.strategy,
            primaryArgs.liquidityToken,
            primaryArgs.expiry,
            primaryArgs.lowerLimit,
            primaryArgs.upperLimit,
          ],
          chainId: network.id as keyof typeof autoWrapManagerAddress,
        }
      : undefined
  );

  const [write, mutationResult] = rpcApi.useWriteContractMutation();
  const isButtonEnabled = prepare && config && config.request;
  const isButtonDisabled = !isButtonEnabled;

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({ setDialogLoadingInfo, txAnalytics }) =>
        isVisible && (
          <TransactionButton
            dataCy="enable-auto-wrap-button"
            disabled={isButtonDisabled}
            onClick={async (signer) => {
              if (isButtonDisabled)
                throw new Error("This should never happen!");
              setDialogLoadingInfo(
                <Typography data-cy="auto-wrap-tx-message" variant="h5" color="text.secondary" translate="yes">
                  You are enabling Auto-Wrap to top up your {token.symbol}{" "}
                  tokens when balance reaches low.
                </Typography>
              );

              write({
                signer,
                request: {
                  ...config.request,
                  chainId: network.id,
                },
                transactionTitle: TX_TITLE,
              })
                .unwrap()
                .then(
                  ...txAnalytics("Enable Auto-Wrap", primaryArgs)
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
