import { Typography } from "@mui/material";
import { constants } from "ethers";
import { FC, memo } from "react";
import { useFormContext } from "react-hook-form";
import { erc20ABI, usePrepareContractWrite, useSigner } from "wagmi";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { VestingToken } from "./CreateVestingSection";

const AddAllowanceTransactionButton: FC<{ token: VestingToken }> = ({
  token,
}) => {
  const { network } = useExpectedNetwork();
  const { watch } = useFormContext<ValidVestingForm>();
  const [
    setupAutoWrap
  ] = watch([
    "data.setupAutoWrap"
  ]);

  // TODO(KK): Check whether there's an underlying token properly...
  const { data: signer } = useSigner();
  const { config } = usePrepareContractWrite({
    enabled: setupAutoWrap && !!network.autoWrap, // TODO(KK): any other conditions to add here?
    address: token.underlyingAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: "approve",
    args: [
      network.autoWrap?.strategyContractAddress as `0x${string}`,
      constants.MaxUint256,
    ],
    signer: signer,
    chainId: network.id,
    overrides: {}, // TODO: overrides
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
        !mutationResult.isSuccess && (
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
                  You are approving auto-wrap (TODO: better name) ERC-20 allowance for the underlying token.
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
            Add allowance
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};

export default memo(AddAllowanceTransactionButton);
