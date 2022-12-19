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
import { ChangeEvent, FC, SyntheticEvent, useState } from "react";
import { useDispatch } from "react-redux";
import Link from "../common/Link";
import ResponsiveDialog from "../common/ResponsiveDialog";
import { enableMainnetFeature } from "../flags/flags.slice";
import { MAINNET_FEATURE_CODE } from "./FeatureFlagContext";

interface AccessCodeDialogProps {
  onClose: () => void;
}

const AccessCodeDialog: FC<AccessCodeDialogProps> = ({ onClose }) => {
  const theme = useTheme();
  const dispatch = useDispatch();

  const [featureCode, setFeatureCode] = useState("");
  const [isInvalidCode, setIsInvalidCode] = useState(false);

  const onFeatureCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsInvalidCode(false);
    setFeatureCode(e.target.value);
  };

  const submitCode = () => {
    if (featureCode === MAINNET_FEATURE_CODE) {
      dispatch(enableMainnetFeature());
      onClose();
    } else {
      setIsInvalidCode(true);
    }
  };

  return (
    <ResponsiveDialog
      open
      onClose={onClose}
      PaperProps={{ sx: { borderRadius: "20px", maxWidth: 520 } }}
    >
      <DialogTitle sx={{ p: 4 }}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h4" sx={{ mb: 3 }}>
            Access Code
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
        <Typography>
          Enter your access code to unlock Ethereum Mainnet.
        </Typography>
        <Typography>
          Apply for the access code{" "}
          <Link href="https://airtable.com/shr8rwXolThzG0q5H" target="_blank">
            here
          </Link>
          .
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 4, pb: 4 }}>
        <Stack gap={2}>
          {isInvalidCode && (
            <Alert severity="error">
              <AlertTitle>Invalid Access Code!</AlertTitle>
            </Alert>
          )}
          <TextField
            fullWidth
            placeholder="Enter Access Code"
            variant="outlined"
            onChange={onFeatureCodeChange}
          />
          <Button
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
