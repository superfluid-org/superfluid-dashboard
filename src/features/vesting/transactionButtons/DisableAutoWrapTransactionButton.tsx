import { ButtonProps, Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { constants } from "ethers";
import { FC, memo } from "react";
import { usePrepareContractWrite, useQuery, useWalletClient } from "wagmi";
import { rpcApi, subgraphApi } from "../../redux/store";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import useGetTransactionOverrides from "../../../hooks/useGetTransactionOverrides";
import { convertOverridesForWagmi } from "../../../utils/convertOverridesForWagmi";
import { Token } from "@superfluid-finance/sdk-core";
import { toVestingToken } from "../useVestingToken";
import { erc20ABI } from "../../../generated";
import { Network } from "../../network/networks";
import { ConnectionBoundaryButtonProps } from "../../transactionBoundary/ConnectionBoundaryButton";

const TX_TITLE: TransactionTitle = "Disable Auto-Wrap";

const DisableAutoWrapTransactionButton: FC<{
  token: Token;
  isVisible: boolean;
  isDisabled: boolean;
  ButtonProps?: ButtonProps;
  network: Network;
  ConnectionBoundaryButtonProps?: Partial<ConnectionBoundaryButtonProps>
}> = ({ token, isVisible, ButtonProps = {}, ConnectionBoundaryButtonProps, network, ...props }) => {
  const { data: walletClient } = useWalletClient();
  const vestingToken = toVestingToken(token, network);
  const getGasOverrides = useGetTransactionOverrides();
  const { data: overrides } = useQuery(
    ["gasOverrides", TX_TITLE, network.id],
    async () => convertOverridesForWagmi(await getGasOverrides(network))
  );

  const primaryArgs = {
    spender: network.autoWrap!.strategyContractAddress,
    amount: BigInt(constants.Zero.toString()),
  };

  const prepare = !props.isDisabled && network.autoWrap && walletClient;
  const { config } = usePrepareContractWrite(
    prepare
      ? {
          abi: erc20ABI,
          functionName: "approve",
          address: vestingToken.underlyingAddress as `0x${string}`,
          chainId: network.id,
          args: [primaryArgs.spender, primaryArgs.amount],
          walletClient,
          ...overrides,
        }
      : undefined
  );

  const [write, mutationResult] = rpcApi.useWriteContractMutation();

  const underlyingTokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: vestingToken.underlyingAddress,
  });
  const underlyingToken = underlyingTokenQuery.data;

  const isButtonEnabled = prepare && config.request;
  const isButtonDisabled = !isButtonEnabled;

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({ network, setDialogLoadingInfo, txAnalytics }) =>
        isVisible && (
          <TransactionButton
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
            onClick={async (signer) => {
              if (isButtonDisabled)
                throw new Error("This should never happen!");

              setDialogLoadingInfo(
                <Typography variant="h5" color="text.secondary" translate="yes">
                  You are revoking Auto-Wrap token allowance for the underlying{" "}
                  {underlyingToken && underlyingToken.symbol} token.
                </Typography>
              );

              write({
                signer,
                request: {
                  ...config.request,
                  chainId: network.id,
                },
                transactionTitle: "Disable Auto-Wrap",
              })
                .unwrap()
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
