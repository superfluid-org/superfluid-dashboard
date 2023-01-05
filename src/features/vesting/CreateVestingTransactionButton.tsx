import { Typography } from "@mui/material";
import { BigNumber } from "ethers";
import Link from "next/link";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { getTimeInSeconds } from "../../utils/dateUtils";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { rpcApi } from "../redux/store";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactionBoundary/TransactionDialog";
import { SanitizedVestingForm } from "./CreateVestingFormProvider";
import { CreateVestingCardView } from "./CreateVestingSection";

export const CreateVestingTransactionButton: FC<{
  setView: (value: CreateVestingCardView) => void;
}> = ({ setView }) => {
  const [createVestingSchedule, createVestingScheduleResult] =
    rpcApi.useCreateVestingScheduleMutation();

  const {
    formState: { isValid: isFormValid, isValidating: isFormValidating },
    handleSubmit,
  } = useFormContext<SanitizedVestingForm>();
  const isDisabled = !isFormValid || isFormValidating;

  return (
    <TransactionBoundary mutationResult={createVestingScheduleResult}>
      {({
        network,
        getOverrides,
        setDialogLoadingInfo,
        setDialogSuccessActions,
      }) =>
        !createVestingScheduleResult.isSuccess && (
          <TransactionButton
            disabled={isDisabled}
            onClick={async (signer) =>
              handleSubmit(
                async ({
                  data: {
                    cliffAmountEther,
                    cliffPeriod,
                    receiverAddress,
                    startDate,
                    superTokenAddress,
                    totalAmountEther,
                    vestingPeriod,
                  },
                }) => {
                  const startDateTimestamp = getTimeInSeconds(startDate);

                  const cliffDateTimestamp =
                    startDateTimestamp +
                    cliffPeriod.numerator * cliffPeriod.denominator;

                  const endDateTimestamp =
                    startDateTimestamp +
                    vestingPeriod.numerator * vestingPeriod.denominator;

                  const timeToFlow = endDateTimestamp - cliffDateTimestamp;

                  const cliffTransferAmount =
                    parseEtherOrZero(cliffAmountEther);
                  const totalAmount = parseEtherOrZero(totalAmountEther);
                  const streamedAmount = totalAmount.sub(cliffTransferAmount);
                  const flowRate =
                    BigNumber.from(streamedAmount).div(timeToFlow);

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
                  createVestingSchedule({
                    chainId: network.id,
                    signer,
                    superTokenAddress,
                    receiverAddress,
                    senderAddress: await signer.getAddress(),
                    startDateTimestamp,
                    cliffDateTimestamp,
                    endDateTimestamp,
                    flowRateWei: flowRate.toString(),
                    cliffTransferAmountWei: cliffTransferAmount.toString(),
                    overrides: await getOverrides(),
                    transactionExtraData: undefined,
                    waitForConfirmation: false,
                  })
                    .unwrap()
                    .then(() => setView(CreateVestingCardView.Success))
                    .catch(() => setView(CreateVestingCardView.Preview)); // Error is already logged and handled in the middleware & UI.

                  setDialogSuccessActions(
                    <TransactionDialogActions>
                      <Link href="/vesting" passHref>
                        <TransactionDialogButton color="primary">
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
            Create the Vesting Schedule
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};
