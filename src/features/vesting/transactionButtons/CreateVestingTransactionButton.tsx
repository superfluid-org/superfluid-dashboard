import { Typography } from "@mui/material";
import Link from "next/link";
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

interface Props {
  setView: (value: CreateVestingCardView) => void;
  isVisible: boolean;
}

export const CreateVestingTransactionButton: FC<Props> = ({
  setView,
  isVisible: isVisible_,
}) => {
  const { txAnalytics } = useAnalytics();
  const [createVestingSchedule, createVestingScheduleResult] =
    rpcApi.useCreateVestingScheduleMutation();

  const { formState, handleSubmit } = useFormContext<ValidVestingForm>();
  const isDisabled = !formState.isValid || formState.isValidating;

  const isVisible = !createVestingScheduleResult.isSuccess && isVisible_;

  return (
    <TransactionBoundary mutationResult={createVestingScheduleResult}>
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
                    data: { receiverAddress, superTokenAddress },
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
                  };
                  createVestingSchedule({
                    ...primaryArgs,
                    signer,
                    overrides: await getOverrides(),
                  })
                    .unwrap()
                    .then(
                      ...txAnalytics("Create Vesting Schedule", primaryArgs)
                    )
                    .then(() => setView(CreateVestingCardView.Success))
                    .catch(() => setView(CreateVestingCardView.Preview)); // Error is already logged and handled in the middleware & UI.

                  setDialogSuccessActions(
                    <TransactionDialogActions>
                      <Link href="/vesting" passHref>
                        <TransactionDialogButton
                          data-cy="ok-button"
                          color="primary"
                        >
                          OK
                        </TransactionDialogButton>
                      </Link>
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
