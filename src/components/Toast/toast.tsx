import { Paper, Stack, Typography } from "@mui/material";
import { FC } from "react";
import { toast } from "react-toastify";

export type ToastProps = {
  title: string;
  message: string;
};

const Toast: FC<ToastProps> = ({ title, message }) => (
  <Stack>
    <Typography variant="h6">{title}</Typography>
    <Typography variant="body1">{message}</Typography>
  </Stack>
);

export const displayToast = (props: ToastProps) =>
  toast(<Toast {...props} />, {
    position: "bottom-right",
    autoClose: 5000,
    closeOnClick: true,
    pauseOnHover: true,
    pauseOnFocusLoss: true,
  });

export default Toast;
