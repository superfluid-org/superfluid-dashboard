import { Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { BigNumber } from "ethers";
import { FC, memo } from "react";
import { useChainId, useQuery, useSigner } from "wagmi";
import {
  autoWrapManagerAddress,
  usePrepareAutoWrapManagerCreateWrapSchedule,
} from "../../../generated";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { rpcApi } from "../../redux/store";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { VestingToken } from "../CreateVestingSection";
import useGetTransactionOverrides from "../../../hooks/useGetTransactionOverrides";
import { convertOverridesForWagmi } from "../../../utils/convertOverridesForWagmi";
import { Network } from "../../network/networks";
import { isEqual } from "lodash";

const TX_TITLE: TransactionTitle = "Enable Auto-Wrap";

const AutoWrapStrategyTransactionButton: FC<{
  token: VestingToken;
  isVisible: boolean;
  isDisabled: boolean;
  network: Network;
  // TODO We can use callbacks to hide/show the parent modal.
  // onSuccessCallback?: () => void;
  // onFailureCallback?: () => void;
  // onClickCallback?: () => void;
}> = ({ token, isVisible, isDisabled: isDisabled_, network }) => {
  const { data: signer } = useSigner();

  const getGasOverrides = useGetTransactionOverrides();
  const { data: overrides } = useQuery(
    ["gasOverrides", TX_TITLE, network.id],
    async () => convertOverridesForWagmi(await getGasOverrides(network))
  );

  const disabled = isDisabled_ || !network.autoWrap;

  const { config } = usePrepareAutoWrapManagerCreateWrapSchedule(
   !network.autoWrap
      ? undefined
      : {
          args: [
            token.address as `0x${string}`,
            network.autoWrap.strategyContractAddress,
            token.underlyingAddress as `0x${string}`,
            BigNumber.from("3000000000"),
            BigNumber.from(network.autoWrap.lowerLimit),
            BigNumber.from(network.autoWrap.upperLimit),
          ],
          chainId: network.id as keyof typeof autoWrapManagerAddress,
          signer,
          overrides,
        }
  );

  const [write, mutationResult] = rpcApi.useWriteContractMutation();
  const isDisabled = disabled || !config;

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
                  You are enabling Auto-Wrap to top up your {token.symbol}{" "}
                  tokens when balance reaches low.
                </Typography>
              );

              write({
                signer,
                config: {
                  ...config,
                  chainId: network.id,
                },
                transactionTitle: TX_TITLE,
              })
                .unwrap()
                .then(
                  ...txAnalytics("Enable Auto-Wrap", {
                    superToken: token.address as `0x${string}`,
                    strategy: network.autoWrap!.strategyContractAddress,
                    liquidityToken: token.underlyingAddress as `0x${string}`,
                    expiry: BigNumber.from("3000000000"),
                    lowerLimit: BigNumber.from(network.autoWrap!.lowerLimit),
                    upperLimit: BigNumber.from(network.autoWrap!.upperLimit),
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
