import { Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { constants } from "ethers";
import { FC, memo } from "react";
import { usePrepareContractWrite, useQuery, useWalletClient } from "wagmi";
import { rpcApi, subgraphApi } from "../../redux/store";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { VestingToken } from "../CreateVestingSection";
import useGetTransactionOverrides from "../../../hooks/useGetTransactionOverrides";
import { convertOverridesForWagmi } from "../../../utils/convertOverridesForWagmi";
import { erc20ABI } from "../../../generated";
import { Network } from "../../network/networks";

const TX_TITLE: TransactionTitle = "Approve Allowance";

const AutoWrapAllowanceTransactionButton: FC<{
  token: VestingToken;
  isVisible: boolean;
  isDisabled: boolean;
  network: Network;
}> = ({ token, isVisible, network, ...props }) => {
  const { data: walletClient } = useWalletClient();
  const getGasOverrides = useGetTransactionOverrides();
  const { data: overrides } = useQuery(
    ["gasOverrides", TX_TITLE, network.id],
    async () => convertOverridesForWagmi(await getGasOverrides(network))
  );

  const primaryArgs = {
    spender: network.autoWrap!.strategyContractAddress,
    amount: BigInt(constants.MaxUint256.toString()),
  };

  const prepare = !props.isDisabled && network.autoWrap && walletClient && walletClient.chain.id === network.id;
  const { config } = usePrepareContractWrite(
    prepare
      ? {
          abi: erc20ABI,
          functionName: "approve",
          address: token.underlyingAddress as `0x${string}`,
          chainId: network.id,
          args: [primaryArgs.spender, primaryArgs.amount],
          ...overrides,
        }
      : undefined
  );

  const [write, mutationResult] = rpcApi.useWriteContractMutation();

  const underlyingTokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token.underlyingAddress,
  });
  const underlyingToken = underlyingTokenQuery.data;

  const isButtonEnabled = prepare && config.request;
  const isButtonDisabled = !isButtonEnabled;

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({ setDialogLoadingInfo, txAnalytics }) =>
        isVisible && (
          <TransactionButton
            disabled={isButtonDisabled}
            onClick={async (signer) => {
              if (isButtonDisabled)
                throw new Error("This should never happen!");
              setDialogLoadingInfo(
                <Typography variant="h5" color="text.secondary" translate="yes">
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
