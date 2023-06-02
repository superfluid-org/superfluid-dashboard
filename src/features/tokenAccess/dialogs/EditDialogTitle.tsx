import { useTheme } from "@mui/material";
import { DialogTitle, IconButton, Stack } from "@mui/material";
import { FC, PropsWithChildren } from "react";
import CloseIcon from "@mui/icons-material/Close";

const EditDialogTitle: FC<PropsWithChildren & { onClose: () => void }> = ({
  children,
  onClose,
}) => {
  const theme = useTheme();
  return (
    <Stack
      component={DialogTitle}
      gap={0.5}
      sx={{ p: 3.5 }}
    >
      {children}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: theme.spacing(3),
          top: theme.spacing(3),
        }}
      >
        <CloseIcon />
      </IconButton>
    </Stack>
  );
};

export default EditDialogTitle;
