import {
  Avatar,
  Button,
  Stack,
  Typography,
  alpha,
  useTheme,
  styled,
  DialogContent,
} from "@mui/material";
import { ErrorRounded } from "@mui/icons-material";
import EditDialogTitle from "./DialogTitle";
import { FC, ReactNode } from "react";

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

const UnsavedChangesConfirmationDialog: FC<{
  onClose: () => void;
  SaveButtonComponent: ReactNode;
}> = ({ SaveButtonComponent, onClose }) => {
  const theme = useTheme();

  return (
    <>
      <EditDialogTitle onClose={onClose}  dataCy={"upsert-approvals-unsaved-form-close-button"}>
        <Stack alignItems="center" direction="column" gap={1}  data-cy={"approvals-unsaved-confirmation-form"}>
          <EditIconWrapper>
            <ErrorRounded
              fontSize="large"
              sx={{ color: theme.palette.warning.main }}
            />
          </EditIconWrapper>
          <Typography variant="h5">You have unsaved changes.</Typography>
          <Typography variant="body1" color="secondary">
            If you leave, your changes won’t be saved.
          </Typography>
        </Stack>
      </EditDialogTitle>
      <Stack component={DialogContent} sx={{ p: 4 }}>
        <Stack gap={2}>
          {SaveButtonComponent}
          <Button
            size="large"
            fullWidth={true}
            variant="outlined"
            onClick={onClose}
          >
            Leave
          </Button>
        </Stack>
      </Stack>
    </>
  );
};

export default UnsavedChangesConfirmationDialog;
