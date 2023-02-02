import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Alert, AlertTitle } from "@mui/lab";
import {
  Button,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/router";
import { ChangeEvent, FC, ReactElement, useState } from "react";
import { useDispatch } from "react-redux";
import Link from "../common/Link";
import ResponsiveDialog from "../common/ResponsiveDialog";
import {
  enableMainnetFeature,
  enableVestingFeature,
} from "../flags/flags.slice";
import {
  MAINNET_FEATURE_CODES,
  VESTING_FEATURE_CODES,
} from "./FeatureFlagContext";

interface AccessCodeDialogProps {
  title: string | ReactElement;
  description: string | ReactElement;
  onClose: () => void;
}

const AccessCodeDialog: FC<AccessCodeDialogProps> = ({
  title,
  description,
  onClose,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();

  const [featureCode, setFeatureCode] = useState("");
  const [isInvalidCode, setIsInvalidCode] = useState(false);

  const onFeatureCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsInvalidCode(false);
    setFeatureCode(e.target.value);
  };

  const submitCode = () => {
    if (MAINNET_FEATURE_CODES.includes(featureCode)) {
      dispatch(enableMainnetFeature());
      onClose();
    } else if (VESTING_FEATURE_CODES.includes(featureCode)) {
      dispatch(enableVestingFeature());
      onClose();
      router.push("/vesting");
    } else {
      setIsInvalidCode(true);
    }
  };

  return (
    <ResponsiveDialog
      data-cy={"access-code-dialog"}
      open
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: "20px", maxWidth: 520 } }}
    >
      <DialogTitle sx={{ p: 4 }}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h4" sx={{ mb: 3 }}>
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: theme.spacing(3),
              top: theme.spacing(3),
            }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
        {description}
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 4 }}>
        <Stack gap={2}>
          {isInvalidCode && (
            <Alert data-cy="access-code-error" severity="error">
              <AlertTitle data-cy={"access-code-error-msg"}>
                Invalid Access Code!
              </AlertTitle>
            </Alert>
          )}
          <TextField
            data-cy={"access-code-input"}
            fullWidth
            placeholder="Enter Access Code"
            variant="outlined"
            onChange={onFeatureCodeChange}
            autoComplete="off"
          />
          <Button
            data-cy={"submit-access-code"}
            variant="contained"
            disabled={!featureCode}
            size="xl"
            onClick={submitCode}
          >
            Submit
          </Button>
        </Stack>
      </DialogContent>
    </ResponsiveDialog>
  );
};

export default AccessCodeDialog;
