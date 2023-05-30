import { Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { BigNumber } from "ethers";
import { FC, memo } from "react";
import { useQuery, useSigner } from "wagmi";
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

const TX_TITLE: TransactionTitle = "Enable Auto-Wrap";

const AutoWrapStrategyTransactionButton: FC<{
  token: VestingToken;
  isVisible: boolean;
  isDisabled: boolean;
  // TODO We can use callbacks to hide/show the parent modal.
  // onSuccessCallback?: () => void;
  // onFailureCallback?: () => void;
  // onClickCallback?: () => void;
}> = ({ token, isVisible, isDisabled: isDisabled_ }) => {
  const { data: signer } = useSigner();
  const { network } = useExpectedNetwork();

  const getGasOverrides = useGetTransactionOverrides();
  const { data: overrides } = useQuery(
    ["gasOverrides", TX_TITLE, network.id],
    async () => convertOverridesForWagmi(await getGasOverrides(network))
  );

  const primaryArgs = {
    superToken: token.address as `0x${string}`,
    strategy: network.autoWrap!.strategyContractAddress,
    liquidityToken: token.underlyingAddress as `0x${string}`,
    expiry: BigNumber.from("3000000000"),
    lowerLimit: BigNumber.from(network.autoWrap!.lowerLimit),
    upperLimit: BigNumber.from(network.autoWrap!.upperLimit),
  };

  const disabled = isDisabled_ && !!network.autoWrap;
  const { config } = usePrepareAutoWrapManagerCreateWrapSchedule(
    disabled
      ? undefined
      : {
          args: [
            primaryArgs.superToken,
            primaryArgs.strategy,
            primaryArgs.liquidityToken,
            primaryArgs.expiry,
            primaryArgs.lowerLimit,
            primaryArgs.upperLimit,
          ],
          chainId: network.id as keyof typeof autoWrapManagerAddress,
          signer,
          overrides,
        }
  );

  const [write, mutationResult] = rpcApi.useWriteContractMutation();
  const isDisabled = isDisabled_ && !config;

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({ network, setDialogLoadingInfo, txAnalytics }) =>
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
                .then(...txAnalytics("Enable Auto-Wrap", primaryArgs))
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
