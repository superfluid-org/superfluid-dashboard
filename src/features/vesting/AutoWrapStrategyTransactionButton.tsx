import { Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { BigNumber } from "ethers";
import { FC, memo } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery, useSigner } from "wagmi";
import { usePrepareAutoWrapManagerCreateWrapSchedule } from "../../generated";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { VestingToken } from "./CreateVestingSection";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";

const TX_TITLE: TransactionTitle = "Enable Auto-Wrap";

const AutoWrapStrategyTransactionButton: FC<{
  token: VestingToken;
  isVisible: boolean;
}> = ({ token, isVisible }) => {
  const { data: signer } = useSigner();
  const { network } = useExpectedNetwork();

  const { watch } = useFormContext<ValidVestingForm>();
  const [setupAutoWrap] = watch(["data.setupAutoWrap"]);

  // { name: 'superToken', internalType: 'address', type: 'address' },
  // { name: 'strategy', internalType: 'address', type: 'address' },
  // { name: 'liquidityToken', internalType: 'address', type: 'address' },
  // { name: 'expiry', internalType: 'uint64', type: 'uint64' },
  // { name: 'lowerLimit', internalType: 'uint64', type: 'uint64' },
  // { name: 'upperLimit', internalType: 'uint64', type: 'uint64' },

  const getGasOverrides = useGetTransactionOverrides();
  const { data: overrides } = useQuery(["gasOverrides", TX_TITLE, network.id], async () => {
    const overrides_ = await getGasOverrides(network);
    return {
      ...overrides_,
      gasPrice: overrides_.gasPrice ? BigNumber.from(overrides_.gasPrice) : undefined,
      gasLimit: overrides_.gasLimit ? BigNumber.from(overrides_.gasLimit) : undefined,
      maxFeePerGas: overrides_.maxFeePerGas ? BigNumber.from(overrides_.maxFeePerGas) : undefined,
      maxPriorityFeePerGas: overrides_.maxPriorityFeePerGas ? BigNumber.from(overrides_.maxPriorityFeePerGas) : undefined
    }
  });

  // TODO(KK): handle errors
  // TODO(KK): Any better way to handle any's and bangs?
  const { config } = usePrepareAutoWrapManagerCreateWrapSchedule({
    chainId: network.id as any,
    enabled: setupAutoWrap, // TODO(KK): any other conditions to add here?
    args: [
      token.address as `0x${string}`,
      network.autoWrap!.strategyContractAddress, // TODO: guard somewhere
      token.underlyingAddress as `0x${string}`, // TODO(KK): guard
      BigNumber.from("3000000000"),
      BigNumber.from(network.autoWrap!.lowerLimit),
      BigNumber.from(network.autoWrap!.upperLimit),
    ],
    signer: signer,
    overrides
  });

  const [write, mutationResult] = rpcApi.useWriteContractMutation();

  return (
    <TransactionBoundary mutationResult={mutationResult}>
      {({
        network,
        getOverrides,
        setDialogLoadingInfo,
        setDialogSuccessActions,
      }) =>
        isVisible && (
          <TransactionButton
            disabled={!config}
            onClick={async (signer) => {
              if (!config) throw new Error("This should never happen!");

              setDialogLoadingInfo(
                <Typography variant="h5" color="text.secondary" translate="yes">
                  You are enabling Auto-Wrap to top up your {token.symbol} tokens when balance reaches low.
                </Typography>
              );

              write({
                signer,
                config: {
                  ...config,
                  chainId: network.id
                },
                transactionTitle: TX_TITLE
              }).unwrap();
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
