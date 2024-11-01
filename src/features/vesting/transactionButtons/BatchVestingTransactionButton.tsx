import { useEffect, useState } from "react";
import { ValidBatchVestingForm } from "../batch/BatchVestingFormProvider";
import { useFormContext } from "react-hook-form";
import { useConnectionBoundary } from "../../transactionBoundary/ConnectionBoundary";
import { rpcApi } from "../../redux/store";
import { CreateVestingCardView } from "../CreateVestingSection";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { Typography } from "@mui/material";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { parseEtherOrZero } from "../../../utils/tokenUtils";
import { TransactionDialogActions, TransactionDialogButton } from "../../transactionBoundary/TransactionDialog";
import { convertBatchFormToParams } from "../batch/convertBatchFormToParams";
import NextLink from "next/link";

interface Props {
    setView: (value: CreateVestingCardView) => void;
    isVisible: boolean;
}

export function BatchVestingTransactionButton({ setView, isVisible: isVisible_ }: Props) {
    const { expectedNetwork } = useConnectionBoundary();

    const { formState: { isValid, isValidating }, handleSubmit } = useFormContext<ValidBatchVestingForm>();

    const [isDisabled, setIsDisabled] = useState(true);
    useEffect(() => {
        setIsDisabled(!isValid || isValidating);
    }, [isValid, isValidating]);

    const [executeBatchVesting, mutationResult] =
        rpcApi.useExecuteBatchVestingMutation();

    const isVisible = !mutationResult.isSuccess && isVisible_;

    return     (<TransactionBoundary mutationResult={mutationResult}>
    {({
      network,
      getOverrides,
      setDialogLoadingInfo,
      setDialogSuccessActions,
      txAnalytics
    }) =>
      isVisible && (
        <TransactionButton
          dataCy={"batch-vesting-tx-button"}
          disabled={isDisabled}
          onClick={async (signer) =>
            handleSubmit(
              async (validForm) => {
                

                setDialogLoadingInfo(
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    translate="yes"
                  >
                    You are creating a batch of vesting schedules.
                  </Typography>
                );

                setView(CreateVestingCardView.Approving);

                const primaryArgs = {
                    params: convertBatchFormToParams(validForm),
                    chainId: network.id,
                    superTokenAddress: validForm.data.superTokenAddress,
                    signer,
                };

                executeBatchVesting(primaryArgs)
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
}