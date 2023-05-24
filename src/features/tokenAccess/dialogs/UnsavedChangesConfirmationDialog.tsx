import { Avatar, Button, Stack, Typography, alpha, useTheme, styled } from "@mui/material";
import { ErrorRounded } from "@mui/icons-material";
import EditDialogTitle from "./EditDialogTitle";
import EditDialogContent from "./EditDialogContent";
import { transactionButtonDefaultProps } from "../../transactionBoundary/TransactionButton";
import { FC } from "react";

export const EditIconWrapper = styled(Avatar)(({ theme }) => ({
  width: "50px",
  height: "50px",
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  borderColor: theme.palette.other.outline,
  [theme.breakpoints.down("md")]: {
    width: "32px",
    height: "32px",
  },
}));

const UnsavedChangesConfirmationDialog: FC<{ onClose: () => void ,  onSaveChanges: () => void}> = ({ onSaveChanges, onClose }) => {
  const theme = useTheme();

  return (
    <>
      <EditDialogTitle onClose={onClose}>
        <Stack alignItems="center" direction="column" gap={1}>
          <EditIconWrapper>
            <ErrorRounded fontSize="large" sx={{ color: theme.palette.warning.main }} />
          </EditIconWrapper>
          <Typography variant="h5">You have unsaved changes.</Typography>
          <Typography variant="body1" color="secondary">
            If you leave, your changes won’t be saved.
          </Typography>
        </Stack>
      </EditDialogTitle>
      <EditDialogContent>
        <Stack component="form" gap={2}>
          <Button {...transactionButtonDefaultProps} onClick={onSaveChanges}>
            Save changes
          </Button>
          <Button
            {...transactionButtonDefaultProps}
            sx={{
              backgroundColor: theme.palette.common.white,
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 1)}`,
              "&:hover": {
                color: theme.palette.common.white,
              },
            }}
            onClick={onClose}
          >
            Leave
          </Button>
        </Stack>
      </EditDialogContent>
    </>
  );
};

export default UnsavedChangesConfirmationDialog;
