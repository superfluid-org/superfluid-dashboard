import { Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { BigNumber, Overrides, constants } from "ethers";
import { FC, memo } from "react";
import { useFormContext } from "react-hook-form";
import { useQuery, useSigner } from "wagmi";
import { usePrepareErc20Approve } from "../../generated";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { VestingToken } from "./CreateVestingSection";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";

const TX_TITLE: TransactionTitle = "Authorize Auto-Wrap" 

const AutoWrapAllowanceTransactionButton: FC<{ token: VestingToken, isVisible: boolean }> = ({
  token,
  isVisible
}) => {
  const { network } = useExpectedNetwork();
  const { watch } = useFormContext<ValidVestingForm>();
  const [
    setupAutoWrap
  ] = watch([
    "data.setupAutoWrap"
  ]);

  const { data: signer } = useSigner();

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

  const { config } = usePrepareErc20Approve({
    enabled: setupAutoWrap && !!network.autoWrap, // TODO(KK): any other conditions to add here?
    address: token.underlyingAddress as `0x${string}`,
    args: [
      network.autoWrap?.strategyContractAddress as `0x${string}`,
      constants.MaxUint256,
    ],
    signer: signer,
    chainId: network.id,
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
                <Typography
                  variant="h5"
                  color="text.secondary"
                  translate="yes"
                >
                  You are approving Auto-Wrap ERC-20 allowance for the underlying token.
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

export default memo(AutoWrapAllowanceTransactionButton);
