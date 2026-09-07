import { useTheme } from "@mui/material";
import { ToastContainer } from "react-toastify";

export const ToastProvider = () => {
  const theme = useTheme();

  return (
    <ToastContainer
      newestOnTop
      theme={theme.palette.mode}
      limit={5}
      progressStyle={{
        background: theme.palette.primary.main,
      }}
    />
  );
};
