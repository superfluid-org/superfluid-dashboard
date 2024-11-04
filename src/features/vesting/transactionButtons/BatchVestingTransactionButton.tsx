import { useEffect, useState } from "react";
import { ValidBatchVestingForm } from "../batch/BatchVestingFormProvider";
import { useFormContext } from "react-hook-form";
import { rpcApi } from "../../redux/store";
import { CreateVestingCardView } from "../CreateVestingSection";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";
import { Typography } from "@mui/material";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionDialogActions, TransactionDialogButton } from "../../transactionBoundary/TransactionDialog";
import { convertBatchFormToParams } from "../batch/convertBatchFormToParams";
import NextLink from "next/link";

interface Props {
    setView: (value: CreateVestingCardView) => void;
    isVisible?: boolean;
    validForm: ValidBatchVestingForm;
    okBehaviour: "close dialog" | "redirect"
}

export function BatchVestingTransactionButton({ setView, isVisible: isVisible_ = true, validForm, okBehaviour }: Props) {
    const { formState: { isValid, isValidating } } = useFormContext<ValidBatchVestingForm>();
    // Note that we're not using handleSubmit for this button to enable chunking.

    const [isDisabled, setIsDisabled] = useState(true);
    useEffect(() => {
        setIsDisabled(!isValid || isValidating);
        if (!isValid) {
            setView(CreateVestingCardView.Form) // Go back to form on validation errors.
        }
    }, [isValid, isValidating]);

    const [executeBatchVesting, mutationResult] =
        rpcApi.useExecuteBatchVestingMutation();

    const isVisible = !mutationResult.isSuccess && isVisible_;

    return (<TransactionBoundary mutationResult={mutationResult}>
        {({
            network,
            getOverrides, // Should I use this?
            setDialogLoadingInfo,
            setDialogSuccessActions,
            txAnalytics,
            closeDialog
        }) =>
            isVisible && (
                <TransactionButton
                    dataCy={"batch-vesting-tx-button"}
                    disabled={isDisabled}
                    onClick={async (signer) => {
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
                                ...txAnalytics("Create Batch of Vesting Schedules", primaryArgs)
                            )
                            .then(() => setView(CreateVestingCardView.Success))
                            .catch(console.error); // Error is already logged and handled in the middleware & UI.

                        setDialogSuccessActions(
                            <TransactionDialogActions>
                                {
                                    okBehaviour === "redirect" ? (
                                        <NextLink href="/vesting" passHref legacyBehavior>
                                            <TransactionDialogButton
                                                data-cy="ok-button"
                                                color="primary"
                                            >
                                                OK
                                            </TransactionDialogButton>
                                        </NextLink>
                                    ) : (
                                        <TransactionDialogButton
                                            data-cy="ok-button"
                                            color="primary"
                                            onClick={closeDialog}
                                        >
                                            OK
                                        </TransactionDialogButton>
                                    )
                                }
                            </TransactionDialogActions>
                        );
                    }}
                >
                    Create Batch of Vesting Schedules
                </TransactionButton>
            )
        }
    </TransactionBoundary>
    );
}