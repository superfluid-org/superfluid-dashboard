import { FC, useState, useEffect } from "react";
import { UnitOfTime } from "../../send/FlowRateInput";
import FlowRateAllowanceEditForm from "./FlowRateAllowanceEditForm";
import FlowRateAllowanceEditFormProvider, {
  FlowRateAllowanceEditFormProviderProps as FlowRateAllowanceEditFormProviderProps,
} from "../EditStreamAllowanceFormProvider";
import { EditDialogButtonProp } from "./AllowanceEditDialog";

const FlowRateAllowanceEditDialog: FC<
  { flowRateAllowance: string; unitOfTime: UnitOfTime } & EditDialogButtonProp
> = ({
  onClose,
  flowRateAllowance: flowRateAllowance,
  unitOfTime,
  onSaveChanges,
}) => {
  const [initialFormValues, setInitialFormValues] = useState<
    FlowRateAllowanceEditFormProviderProps["initialFormValues"] | undefined
  >();

  useEffect(() => {
    setInitialFormValues({
      flowRateAllowance: {
        amountEther: flowRateAllowance,
        unitOfTime: unitOfTime,
      },
    });
  }, [flowRateAllowance, unitOfTime]);

  if (!initialFormValues) {
    return null;
  }

  return (
    <FlowRateAllowanceEditFormProvider initialFormValues={initialFormValues}>
      <FlowRateAllowanceEditForm
        onClose={onClose}
        flowRateAllowance={flowRateAllowance}
        unitOfTime={unitOfTime}
        onSaveChanges={onSaveChanges}
      />
    </FlowRateAllowanceEditFormProvider>
  );
};

export default FlowRateAllowanceEditDialog;
