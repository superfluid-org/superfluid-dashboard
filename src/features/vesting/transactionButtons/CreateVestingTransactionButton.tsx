import { Typography } from "@mui/material";
import NextLink from "next/link";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { useAnalytics } from "../../analytics/useAnalytics";
import { rpcApi } from "../../redux/store";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../../transactionBoundary/TransactionDialog";
import { calculateAdditionalDataFromValidVestingForm } from "../calculateAdditionalDataFromValidVestingForm";
import { ValidVestingForm } from "../CreateVestingFormProvider";
import { CreateVestingCardView } from "../CreateVestingSection";
import { parseEtherOrZero } from "../../../utils/tokenUtils";
import { useHasFlag } from "../../flags/flagsHooks";
import { Flag } from "../../flags/flags.slice";
import { useAccount } from "wagmi";
import { getAddress } from "../../../utils/memoizedEthersUtils";
import { useConnectionBoundary } from "../../transactionBoundary/ConnectionBoundary";

interface Props {
  setView: (value: CreateVestingCardView) => void;
  isVisible: boolean;
}

export const CreateVestingTransactionButton: FC<Props> = ({
  setView,
  isVisible: isVisible_,
}) => {
  const { txAnalytics } = useAnalytics();

  const { expectedNetwork } = useConnectionBoundary();

  const { address: accountAddress } = useAccount();
  const isVestingV2Enabled = useHasFlag(
    accountAddress
      ? {
        type: Flag.VestingScheduler,
        chainId: expectedNetwork.id,
        account: getAddress(accountAddress),
        version: "v2"
      }
      : undefined
  );

  const [createVestingScheduleFromAmountAndDuration, createVestingScheduleFromAmountAndDurationResult] =
    rpcApi.useCreateVestingScheduleFromAmountAndDurationMutation();

  const [createVestingSchedule, createVestingScheduleResult] =
    rpcApi.useCreateVestingScheduleMutation();

  const mutationResult = isVestingV2Enabled ? createVestingScheduleFromAmountAndDurationResult : createVestingScheduleResult;

  const { formState, handleSubmit } = useFormContext<ValidVestingForm>();
  const isDisabled = !formState.isValid || formState.isValidating;

  const isVisible = !mutationResult.isSuccess && isVisible_;

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
            dataCy={"create-schedule-tx-button"}
            disabled={isDisabled}
            onClick={async (signer) =>
              handleSubmit(
                async (validData) => {
                  const {
                    data: { receiverAddress, superTokenAddress, claimEnabled },
                  } = validData;
                  const {
                    startDateTimestamp,
                    cliffDateTimestamp,
                    endDateTimestamp,
                    flowRate,
                    cliffAmount,
                  } = calculateAdditionalDataFromValidVestingForm(validData);

                  setDialogLoadingInfo(
                    <Typography
                      variant="h5"
                      color="text.secondary"
                      translate="yes"
                    >
                      You are creating a vesting schedule.
                    </Typography>
                  );

                  setView(CreateVestingCardView.Approving);

                  const primaryArgs = {
                    chainId: network.id,
                    superTokenAddress,
                    senderAddress: await signer.getAddress(),
                    receiverAddress,
                    startDateTimestamp,
                    cliffDateTimestamp,
                    endDateTimestamp,
                    flowRateWei: flowRate.toString(),
                    cliffTransferAmountWei: cliffAmount.toString(),
                    claimEnabled: !!claimEnabled
                  };

                  const primaryArgsFromAmountAndDuration = {
                    chainId: network.id,
                    superTokenAddress,
                    senderAddress: await signer.getAddress(),
                    receiverAddress,
                    startDateTimestamp,
                    totalAmountWei: parseEtherOrZero(validData.data.totalAmountEther).toString(),
                    totalDurationInSeconds: Math.round(validData.data.vestingPeriod.numerator * validData.data.vestingPeriod.denominator),
                    cliffPeriodInSeconds: validData.data.cliffEnabled ? Math.round(validData.data.cliffPeriod.numerator! * validData.data.cliffPeriod.denominator) : 0,
                    cliffTransferAmountWei: cliffAmount.toString(),
                    claimEnabled: !!claimEnabled
                  };

                  (isVestingV2Enabled ? createVestingSchedule({
                    ...primaryArgs,
                    signer,
                    overrides: await getOverrides(),
                  }) : createVestingScheduleFromAmountAndDuration({
                    ...primaryArgsFromAmountAndDuration,
                    signer,
                    overrides: await getOverrides(),
                  }))
                    .unwrap()
                    .then(
                      ...txAnalytics("Create Vesting Schedule", primaryArgs)
                    )
                    .then(() => setView(CreateVestingCardView.Success))
                    .catch(() => setView(CreateVestingCardView.Preview)); // Error is already logged and handled in the middleware & UI.

                  setDialogSuccessActions(
                    <TransactionDialogActions>
                      <NextLink href="/vesting" passHref legacyBehavior>
                        <TransactionDialogButton
                          data-cy="ok-button"
                          color="primary"
                        >
                          OK
                        </TransactionDialogButton>
                      </NextLink>
                    </TransactionDialogActions>
                  );
                },
                () => setView(CreateVestingCardView.Form) // Go back to form on validation errors.
              )()
            }
          >
            Create Vesting Schedule
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};
