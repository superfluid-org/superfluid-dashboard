import { FC, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Stack, FormGroup, Typography, TextField, Button } from '@mui/material';
import { PartialEditERC20AllowanceAllowanceForm } from '../EditERC20AllowanceFormProvider';
import EditDialogContent from './EditDialogContent';
import EditDialogTitle from './EditDialogTitle';
import UnsavedChangesConfirmationDialog, { EditIconWrapper } from './UnsavedChangesConfirmationDialog';
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { transactionButtonDefaultProps } from '../../transactionBoundary/TransactionButton';
import { EditDialogButtonProp } from './AllowanceEditDialog';
import { parseEtherOrZero } from '../../../utils/tokenUtils';

export type TokenAllowanceEditFormProps = {
  tokenAllowance: string;
};

const TokenAllowanceEditForm: FC<TokenAllowanceEditFormProps & EditDialogButtonProp> = ({ onClose, onSaveChanges, tokenAllowance }) => {
  const { control, formState, watch } = useFormContext<PartialEditERC20AllowanceAllowanceForm>();

  const [hasUnsavedChanges, setUnsavedChanges] = useState<boolean>(false);

  const watchedTokenAllowance = watch('data.tokenAllowance');
  const isAllowanceChanged = watchedTokenAllowance !== tokenAllowance;

  const handleOnCloseBtnClick = () => {
    if (isAllowanceChanged) {
      setUnsavedChanges(true);
    } else {
      onClose();
    }
  };

  const handleOnSaveChangesBtnClick = () => {
    onSaveChanges(
      'tokenAllowance', parseEtherOrZero(watchedTokenAllowance)
    );
    onClose();
  };

  return hasUnsavedChanges ? (
    <UnsavedChangesConfirmationDialog onClose={onClose} onSaveChanges={handleOnSaveChangesBtnClick} />
  ) : (
    <>
      <EditDialogTitle onClose={handleOnCloseBtnClick}>
        <Stack alignItems="center" direction="column" gap={1}>
          <EditIconWrapper>
            <EditRoundedIcon />
          </EditIconWrapper>
          <Typography variant="h5">Modify Allowance</Typography>
          <Typography variant="body1" color="secondary">
            Define transfer allowance cap for Super Tokens
          </Typography>
        </Stack>
      </EditDialogTitle>
      <EditDialogContent>
        <Stack component="form" gap={4}>
          <Stack gap={2.5}>
            <FormGroup>
              <Controller
                control={control}
                name="data.tokenAllowance"
                render={({ field }) => (
                  <TextField
                    data-cy="token-allowance-amount-input"
                    {...field}
                  />
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

export default TokenAllowanceEditForm;
