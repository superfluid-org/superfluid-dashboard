import { Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { BigNumber, constants } from "ethers";
import { FC, memo } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery, useSigner } from "wagmi";
import { usePrepareErc20Approve } from "../../generated";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi, subgraphApi } from "../redux/store";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { VestingToken } from "./CreateVestingSection";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { convertOverridesForWagmi } from "../../utils/convertOverridesForWagmi";

const TX_TITLE: TransactionTitle = "Approve Allowance"

const AutoWrapAllowanceTransactionButton: FC<{
  token: VestingToken;
  isVisible: boolean;
}> = ({ token, isVisible }) => {
  const { network } = useExpectedNetwork();
  const { watch } = useFormContext<ValidVestingForm>();
  const [setupAutoWrap] = watch(["data.setupAutoWrap"]);

  const { data: signer } = useSigner();

  const getGasOverrides = useGetTransactionOverrides();
  const { data: overrides } = useQuery(
    ["gasOverrides", TX_TITLE, network.id],
    async () => convertOverridesForWagmi(await getGasOverrides(network))
  );

  const primaryArgs = {
    spender: network.autoWrap!.strategyContractAddress,
    amount: constants.MaxUint256,
  };

  const { config } = usePrepareErc20Approve({
    enabled: setupAutoWrap && !!network.autoWrap, // TODO(KK): any other conditions to add here?
    address: token.underlyingAddress as `0x${string}`,
    chainId: network.id,
    args: [primaryArgs.spender, primaryArgs.amount],
    signer,
    overrides,
  });

  const [write, mutationResult] = rpcApi.useWriteContractMutation();

  const underlyingTokenQuery = subgraphApi.useTokenQuery({
      chainId: network.id,
      id: token.underlyingAddress
    }
  );
  const underlyingToken = underlyingTokenQuery.data;

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({
        network,
        getOverrides,
        setDialogLoadingInfo,
        setDialogSuccessActions,
        txAnalytics,
      }) =>
        isVisible && (
          <TransactionButton
            disabled={!config}
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
