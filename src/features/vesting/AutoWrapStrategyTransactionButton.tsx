import { Typography } from "@mui/material";
import { TransactionTitle } from "@superfluid-finance/sdk-redux";
import { BigNumber } from "ethers";
import { FC, memo } from "react";
import { useFormContext } from "react-hook-form";
import { useSigner } from "wagmi";
import { usePrepareAutoWrapManagerCreateWrapSchedule } from "../../generated";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { VestingToken } from "./CreateVestingSection";

const BUTTON_TITLE: TransactionTitle = "Approve Auto Wrap";

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

  // TODO(KK): handle errors
  // TODO(KK): Check whether there's an underlying token properly...
  // TODO(KK): Any better way to handle any's and bangs?
  const { config } = usePrepareAutoWrapManagerCreateWrapSchedule({
    chainId: network.id as any,
    enabled: setupAutoWrap, // TODO(KK): any other conditions to add here?
    args: [
      token.address as `0x${string}`,
      network.autoWrap!.strategyContractAddress, // TODO: guard somewhere
      token.underlyingAddress as `0x${string}`, // TODO(KK): guard
      BigNumber.from("18446744073709551615"),
      BigNumber.from(network.autoWrap!.lowerLimit),
      BigNumber.from(network.autoWrap!.upperLimit),
    ],
    signer: signer,
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
                  You are setting up Auto Wrap to wrap your tokens when balances reaches low.
                </Typography>
              );

              write({
                signer,
                config: {
                  ...config,
                  chainId: network.id,
                },
              }).unwrap();
            }}
          >
            {BUTTON_TITLE}
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};

export default memo(AutoWrapStrategyTransactionButton);
