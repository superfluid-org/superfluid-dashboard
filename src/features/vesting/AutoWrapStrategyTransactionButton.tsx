import { Typography } from "@mui/material";
import { BigNumber, constants } from "ethers";
import { FC, memo } from "react";
import { useFormContext } from "react-hook-form";
import { erc20ABI, usePrepareContractWrite, useSigner } from "wagmi";
import { autoWrapManagerABI, autoWrapStrategyABI } from "../../generated";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { VestingToken } from "./CreateVestingSection";

const AutoWrapStrategyTransactionButton: FC<{ token: VestingToken, isVisible: boolean }> = ({
  token,
  isVisible
}) => {
  const { data: signer } = useSigner();
  const { network } = useExpectedNetwork();

  const { watch } = useFormContext<ValidVestingForm>();
  const [
    setupAutoWrap
  ] = watch([
    "data.setupAutoWrap"
  ]);

  // { name: 'superToken', internalType: 'address', type: 'address' },
  // { name: 'strategy', internalType: 'address', type: 'address' },
  // { name: 'liquidityToken', internalType: 'address', type: 'address' },
  // { name: 'expiry', internalType: 'uint64', type: 'uint64' },
  // { name: 'lowerLimit', internalType: 'uint64', type: 'uint64' },
  // { name: 'upperLimit', internalType: 'uint64', type: 'uint64' },

  // TODO(KK): handle errors
  // TODO(KK): Check whether there's an underlying token properly...
  const { config } = usePrepareContractWrite({
    enabled: setupAutoWrap && !!network.autoWrap, // TODO(KK): any other conditions to add here?
    address: network.autoWrap!.managerContractAddress as `0x${string}`,
    abi: autoWrapManagerABI,
    functionName: "createWrapSchedule",
    args: [
      token.address as `0x${string}`,
      network.autoWrap!.strategyContractAddress, // TODO: guard somewhere
      token.underlyingAddress as `0x${string}`, // TODO(KK): guard
      BigNumber.from("18446744073709551615"),
      BigNumber.from("604800"),
      BigNumber.from("604800")
    ],
    signer: signer,
    chainId: network.id,
    overrides: { gasLimit: BigNumber.from("1000000") }, // TODO: overrides
  });

  const [trigger, mutationResult] = rpcApi.useWriteContractMutation();

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
                  You are setting up auto-wrap strategy.
                </Typography>
              );

              trigger({
                signer,
                config: {
                  ...config,
                  chainId: network.id,
                },
              }).unwrap();
            }}
          >
            Configure Auto Wrap
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};

export default memo(AutoWrapStrategyTransactionButton);
