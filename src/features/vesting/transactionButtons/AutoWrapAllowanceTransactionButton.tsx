import { Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { constants } from "ethers";
import { FC, memo } from "react";
import { useChainId, useQuery, useSigner } from "wagmi";
import { usePrepareErc20Approve } from "../../../generated";
import { rpcApi, subgraphApi } from "../../redux/store";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { VestingToken } from "../CreateVestingSection";
import useGetTransactionOverrides from "../../../hooks/useGetTransactionOverrides";
import { convertOverridesForWagmi } from "../../../utils/convertOverridesForWagmi";
import { Network } from "../../network/networks";

const TX_TITLE: TransactionTitle = "Approve Allowance";

const AutoWrapAllowanceTransactionButton: FC<{
  token: VestingToken;
  isVisible: boolean;
  isDisabled: boolean;
  network: Network;
}> = ({ token, isVisible, isDisabled: isDisabled_, network }) => {
  const { data: signer } = useSigner();
  const getGasOverrides = useGetTransactionOverrides();
  const { data: overrides } = useQuery(
    ["gasOverrides", TX_TITLE, network.id],
    async () => convertOverridesForWagmi(await getGasOverrides(network))
  );

  const disabled =
    isDisabled_ || !network?.autoWrap;
  const { config } = usePrepareErc20Approve(
    !network?.autoWrap
      ?  undefined :{
          address: token.underlyingAddress as `0x${string}`,
          chainId: network.id,
          args: [
            network.autoWrap.strategyContractAddress,
            constants.MaxUint256,
          ],
          signer,
          overrides,
        }
  );

  const [write, mutationResult] = rpcApi.useWriteContractMutation();

  const underlyingTokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: token.underlyingAddress,
  });
  const underlyingToken = underlyingTokenQuery.data;
  const isDisabled = disabled && !config;

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({ setDialogLoadingInfo, txAnalytics }) =>
        isVisible && (
          <TransactionButton
            disabled={isDisabled}
            onClick={async (signer) => {
              if (!config) throw new Error("This should never happen!");
              setDialogLoadingInfo(
                <Typography variant="h5" color="text.secondary" translate="yes">
                  You are approving Auto-Wrap ERC-20 allowance for the
                  underlying token.
                </Typography>
              );

              write({
                signer,
                config: {
                  ...config,
                  chainId: network.id,
                },
                transactionTitle: "Approve Allowance",
              })
                .unwrap()
                .then(
                  ...txAnalytics("Approve Auto-Wrap Allowance", {
                    spender: network.autoWrap!.strategyContractAddress,
                    amount: constants.MaxUint256,
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
