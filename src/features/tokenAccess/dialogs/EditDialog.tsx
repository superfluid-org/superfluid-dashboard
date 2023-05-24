import { formatEther } from "ethers/lib/utils.js";
import { FC } from "react";
import { Stack } from "@mui/material";
import { TokenAccessProps } from "../TokenAccessRow";
import FlowRateAllowanceEditDialog from "./FlowRateAllowanceEditDialog";
import TokenAllowanceEditDialog from "./TokenAllowanceEditDialog";

export interface EditDialogButtonProp {
  onClose: () => void;
  onSaveChanges: <K extends keyof TokenAccessProps>(
    key: K,
    value: TokenAccessProps[K]
  ) => void;
}

interface ERC20AllowanceEditProps {
  permissionsAndAllowances: TokenAccessProps;
}

const EditDialog: FC<
  ERC20AllowanceEditProps &
    EditDialogButtonProp & { editType: "EDIT_ERC20" | "EDIT_STREAM" }
> = ({
  onClose,
  permissionsAndAllowances,
  editType,
  onSaveChanges: onSaveChanges,
}) => {
  return (
    <Stack component={"form"}>
      {editType === "EDIT_ERC20" && (
        <TokenAllowanceEditDialog
          onClose={onClose}
          tokenAllowance={formatEther(permissionsAndAllowances.tokenAllowance)}
          onSaveChanges={onSaveChanges}
        />
      )}
      {editType === "EDIT_STREAM" && (
        <FlowRateAllowanceEditDialog
          onClose={onClose}
          flowRateAllowance={formatEther(
            permissionsAndAllowances.flowRateAllowance.amountEther
          )}
          unitOfTime={permissionsAndAllowances.flowRateAllowance.unitOfTime}
          onSaveChanges={onSaveChanges}
        />
      )}
    </Stack>
  );
};

export default EditDialog;
