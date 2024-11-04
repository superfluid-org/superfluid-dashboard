import { useFormContext } from "react-hook-form";
import { SuperTokenMinimal } from "../../redux/endpoints/tokenTypes";
import { CreateVestingCardView } from "../CreateVestingSection";
import { ValidBatchVestingForm } from "./BatchVestingFormProvider";
import { BatchVestingTransactionButton } from "../transactionButtons/BatchVestingTransactionButton";
import { useCallback, useMemo, useState } from "react";
import { StepLabel, Stepper } from "@mui/material";
import { Stack } from "@mui/material";
import { Step } from "@mui/material";

export type Props = {
    token: SuperTokenMinimal;
    setView: (value: CreateVestingCardView) => void;
}

const chunkSize = 2;

export function BatchVestingTransactionSection({
    setView,
}: Props) {
    const { watch, reset } = useFormContext<ValidBatchVestingForm>();
    const validForm = watch();

    const chunks = useMemo(() => chunkFormData(validForm, chunkSize), [validForm]);
    const hasChunks = chunks.length > 1;

    const [activeStep, setActiveStep] = useState(0);

    const nonLastIndexSetView = useCallback((value: CreateVestingCardView) => {
        if (value == CreateVestingCardView.Success) {
            setActiveStep(prev => prev + 1);
        } else {
            setView(value);
        }
    }, [setActiveStep, setView]);

    const lastIndexSetView = useCallback((value: CreateVestingCardView) => {
        if (value == CreateVestingCardView.Success) {
            setActiveStep(prev => prev + 1);
        }
        setView(value);
    }, [setActiveStep, setView]);

    if (!hasChunks) {
        return <BatchVestingTransactionButton setView={setView} validForm={validForm} okBehaviour="redirect" />
    }

    return (
        <Stack spacing={3}>
            <Stepper activeStep={activeStep}>
                {chunks.map((_, index) => (
                    <Step key={index}>
                        <StepLabel>{`Batch #${index + 1}`}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            {
                chunks.map((chunk, index) => {
                    const chunkCount = chunks.length;
                    const isLastChunk = index == chunkCount - 1;
                    return (
                        <BatchVestingTransactionButton
                            key={index}
                            setView={isLastChunk ? lastIndexSetView : nonLastIndexSetView}
                            validForm={chunk}
                            isVisible={activeStep == index}
                            okBehaviour={isLastChunk ? "redirect" : "close dialog"}
                        />
                    );
                })
            }
        </Stack>
    )
}

function chunkFormData(formData: ValidBatchVestingForm, chunkSize: number): ValidBatchVestingForm[] {
    const schedules = formData.data.schedules;

    const chunks = splitArrayIntoChunks(schedules, chunkSize);

    return chunks.map((chunk) => ({
        ...formData,
        data: { ...formData.data, schedules: chunk },
    }));
}

function splitArrayIntoChunks<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
}