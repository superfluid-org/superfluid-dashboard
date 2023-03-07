import { Stack, Typography } from "@mui/material";
import { FC } from "react";
import { toast } from "react-toastify";
import { MessageData } from "../../hooks/useNotificationChannels";
import { createMessage, getNotificationIcon } from "../../utils/notification";

export type ToastProps = {
  title: string;
  message: {
    raw: string;
    parsed: MessageData;
  };
};

const Toast: FC<ToastProps> = ({ title, message }) => (
  <Stack>
    <Stack direction="row" alignItems="center" gap={0.5}>
      {getNotificationIcon(message.parsed)}
      <Typography variant="h6"> {title}</Typography>
    </Stack>

    <Typography variant="body1">{createMessage(message)}</Typography>
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
