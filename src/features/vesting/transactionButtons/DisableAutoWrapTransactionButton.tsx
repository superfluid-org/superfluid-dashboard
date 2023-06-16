import { ButtonProps, Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { constants } from "ethers";
import { FC, memo } from "react";
import { useQuery, useWalletClient } from "wagmi";
import { usePrepareErc20Approve } from "../../../generated";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { rpcApi, subgraphApi } from "../../redux/store";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import useGetTransactionOverrides from "../../../hooks/useGetTransactionOverrides";
import { convertOverridesForWagmi } from "../../../utils/convertOverridesForWagmi";
import { Token } from "@superfluid-finance/sdk-core";
import { toVestingToken } from "../useVestingToken";

const TX_TITLE: TransactionTitle = "Disable Auto-Wrap";

const DisableAutoWrapTransactionButton: FC<{
  token: Token;
  isVisible: boolean;
  isDisabled: boolean;
  ButtonProps?: ButtonProps;
}> = ({ token, isVisible, isDisabled: isDisabled_, ButtonProps = {} }) => {
  const { network } = useExpectedNetwork();
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

  const { config } = usePrepareErc20Approve(
    network.autoWrap
      ? {
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
  const isDisabled = isDisabled_ && !config;

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({ network, setDialogLoadingInfo, txAnalytics }) =>
        isVisible && (
          <TransactionButton
            ConnectionBoundaryButtonProps={{
              impersonationTitle: "Stop viewing",
              changeNetworkTitle: "Change Network",
            }}
            disabled={isDisabled}
            ButtonProps={{
              size: "medium",
              ...ButtonProps,
            }}
            onClick={async (signer) => {
              if (!config) throw new Error("This should never happen!");

              setDialogLoadingInfo(
                <Typography variant="h5" color="text.secondary" translate="yes">
                  You are revoking Auto-Wrap ERC-20 allowance for the underlying{" "}
                  {underlyingToken && underlyingToken.symbol} token.
                </Typography>
              );

              // TODO(KK): wagmi migration
            //   write({
            //     signer,
            //     config: {
            //       ...config,
            //       chainId: network.id,
            //     },
            //     transactionTitle: "Disable Auto-Wrap",
            //   })
            //     .unwrap()
            //     .then(...txAnalytics("Disable Auto-Wrap", primaryArgs))
            //     .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
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
