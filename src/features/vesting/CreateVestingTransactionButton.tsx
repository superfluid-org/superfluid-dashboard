import { BigNumber } from "ethers";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
import { getTimeInSeconds } from "../../utils/dateUtils";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { rpcApi } from "../redux/store";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { ValidVestingForm } from "./CreateVestingFormProvider";

export const CreateVestingTransactionButton: FC = () => {
  const [createVestingSchedule, createVestingScheduleResult] =
    rpcApi.useCreateVestingScheduleMutation();

  const { formState, handleSubmit } = useFormContext<ValidVestingForm>();
  const isDisabled = !formState.isValid || formState.isValidating;

  return (
    <TransactionBoundary mutationResult={createVestingScheduleResult}>
      {({ network, getOverrides }) => (
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

                const cliffTransferAmount = parseEtherOrZero(cliffAmountEther);
                const totalAmount = parseEtherOrZero(totalAmountEther);
                const streamedAmount = totalAmount.sub(cliffTransferAmount);
                const flowRate = BigNumber.from(streamedAmount).div(timeToFlow);

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
                }).unwrap();

              }
            )()
          }
        >
          Create
        </TransactionButton>
      )}
    </TransactionBoundary>
  );
};
