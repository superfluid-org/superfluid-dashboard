import { FC, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {Stack, FormGroup, Typography, TextField, Button, Box} from '@mui/material';
import { PartialTokenAllowanceForm } from '../EditTokenAllowanceFormProvider';
import EditDialogContent from './EditDialogContent';
import EditDialogTitle from './EditDialogTitle';
import UnsavedChangesConfirmationDialog, { EditIconWrapper } from './UnsavedChangesConfirmationDialog';
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { transactionButtonDefaultProps } from '../../transactionBoundary/TransactionButton';
import { EditDialogButtonProp } from './EditDialog';
import { parseEtherOrZero } from '../../../utils/tokenUtils';

export type TokenAllowanceEditFormProps = {
  tokenAllowance: string;
};

const TokenAllowanceEditForm: FC<TokenAllowanceEditFormProps & EditDialogButtonProp> = ({ onClose, onSaveChanges, tokenAllowance }) => {
  const { control, formState, watch } = useFormContext<PartialTokenAllowanceForm>();

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
    <Box sx={{width: "524px", height: "326px"}}>
      <EditDialogTitle onClose={handleOnCloseBtnClick}>
          <EditIconWrapper>
            <EditRoundedIcon />
          </EditIconWrapper>
          <Typography variant="h5">Modify Allowance</Typography>
          <Typography variant="body1" color="secondary">
            Define transfer allowance cap for Super Tokens
          </Typography>
      </EditDialogTitle>
      <EditDialogContent>
          <Stack gap={3}>
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
            <Button
              {...transactionButtonDefaultProps}
              disabled={!formState.isValid || formState.isValidating}
              onClick={handleOnSaveChangesBtnClick}
            >
              Save changes
            </Button>
          </Stack>
      </EditDialogContent>
    </Box>
  );
};

export default TokenAllowanceEditForm;
