import { FC, useState, useEffect } from "react";
import EditTokenAllowanceFormProvider, { TokenAllowanceEditFormProviderProps as TokenAllowanceEditFormProviderProps } from "../EditTokenAllowanceFormProvider";
import TokenAllowanceEditForm, { TokenAllowanceEditFormProps as TokenAllowanceEditFormProps } from "./TokenAllowanceEditForm";
import { EditDialogButtonProp } from "./EditDialog";

const TokenAllowanceEditDialog: FC<TokenAllowanceEditFormProps & EditDialogButtonProp> = ({ onClose, tokenAllowance, onSaveChanges }) => {
  const [initialFormValues, setInitialFormValues] = useState<TokenAllowanceEditFormProviderProps["initialFormValues"] | undefined>();

  useEffect(() => {
    setInitialFormValues({
      tokenAllowance: tokenAllowance,
    });
  }, [tokenAllowance]);

  if (!initialFormValues) {
    return null;
  }

  return (
    <EditTokenAllowanceFormProvider initialFormValues={initialFormValues}>
      <TokenAllowanceEditForm onClose={onClose} tokenAllowance={tokenAllowance} onSaveChanges={onSaveChanges} />
    </EditTokenAllowanceFormProvider>
  );
};

export default TokenAllowanceEditDialog;