import { FC, PropsWithChildren, useState, useEffect } from "react";
import TokenAllowanceEditFormProvider, { TokenAllowanceEditFormProviderProps as TokenAllowanceEditFormProviderProps } from "../EditERC20AllowanceFormProvider";
import TokenAllowanceEditForm, { TokenAllowanceEditFormProps as TokenAllowanceEditFormProps } from "./TokenAllowanceEditForm";
import { EditDialogButtonProp } from "./AllowanceEditDialog";

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
    <TokenAllowanceEditFormProvider initialFormValues={initialFormValues}>
      <TokenAllowanceEditForm onClose={onClose} tokenAllowance={tokenAllowance} onSaveChanges={onSaveChanges} />
    </TokenAllowanceEditFormProvider>
  );
};

export default TokenAllowanceEditDialog;