import { FC, useState } from "react";
import { Button, FormGroup, Stack, Typography } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { FlowRateInput, UnitOfTime } from "../../send/FlowRateInput";
import { Controller, useFormContext } from "react-hook-form";
import { PartialEditStreamAllowanceForm } from "../EditStreamAllowanceFormProvider";
import { transactionButtonDefaultProps } from "../../transactionBoundary/TransactionButton";
import EditDialogTitle from "./EditDialogTitle";
import EditDialogContent from "./EditDialogContent";
import UnsavedChangesConfirmationDialog, { EditIconWrapper } from "./UnsavedChangesConfirmationDialog";
import { EditDialogButtonProp } from "./AllowanceEditDialog";
import { parseEtherOrZero } from "../../../utils/tokenUtils";

const FlowRateAllowanceEditForm: FC<{ flowRateAllowance: string, unitOfTime: UnitOfTime } & EditDialogButtonProp> = ({ onClose, flowRateAllowance: flowRateAllowance, unitOfTime, onSaveChanges }) => {
  const [hasUnsavedChanges, setUnsavedChanges] = useState<boolean>(false);
  const { control, formState, watch } = useFormContext<PartialEditStreamAllowanceForm>();

  const watchedFlowRateAllowance = watch("data.flowRateAllowance");
  const isAmountEtherChanged = watchedFlowRateAllowance.amountEther !== flowRateAllowance;
  const isUnitOfTimeChanged = watchedFlowRateAllowance.unitOfTime !== unitOfTime;
  const hasUnsavedFormChanges = isAmountEtherChanged || isUnitOfTimeChanged;

  const handleOnCloseBtnClick = () => {
    if (hasUnsavedFormChanges) {
      setUnsavedChanges(true);
    } else {
      onClose();
    }
  };

  const handleOnSaveChangesBtnClick = () => {
    onSaveChanges(
      'flowRateAllowance', {
      amountEther: parseEtherOrZero(watchedFlowRateAllowance.amountEther),
      unitOfTime: watchedFlowRateAllowance.unitOfTime
    }
    );
    onClose();
  };

  return hasUnsavedChanges ? (
    <UnsavedChangesConfirmationDialog onClose={onClose} onSaveChanges={handleOnSaveChangesBtnClick} />
  ) : (
    <>
      <EditDialogTitle onClose={handleOnCloseBtnClick}>
        <Stack alignItems="center" direction="column">
          <EditIconWrapper>
            <EditRoundedIcon />
          </EditIconWrapper>
          <Typography variant="h4">Modify Allowance</Typography>
          <Typography variant="body1mono" color="secondary">
            Define flow rate allowance for Super Tokens
          </Typography>
        </Stack>
      </EditDialogTitle>
      <EditDialogContent>
        <Stack component="form" gap={4}>
          <Stack gap={2.5}>
            <FormGroup>
              <Controller
                control={control}
                name="data.flowRateAllowance"
                render={({ field: { value, onChange, onBlur } }) => (
                  <FlowRateInput flowRateEther={value} onChange={onChange} onBlur={onBlur} />
                )}
              />
            </FormGroup>
          </Stack>
          <Stack gap={1}>
            <Button
              {...transactionButtonDefaultProps}
              disabled={!formState.isValid || formState.isValidating}
              onClick={handleOnSaveChangesBtnClick}
            >
              Save changes
            </Button>
          </Stack>
        </Stack>
      </EditDialogContent>
    </>
  );
};

export default FlowRateAllowanceEditForm;
