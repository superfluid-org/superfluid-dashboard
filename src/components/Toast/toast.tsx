import { Stack, Typography, useTheme } from "@mui/material";
import { FC, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useDisplayedToasts } from "../../features/notifications/notificationHooks";
import { updateDisplayedToasts } from "../../features/notifications/notifications.slice";
import { useAppDispatch } from "../../features/redux/store";
import { MessageData } from "../../hooks/useNotificationChannels";
import { createMessage, getNotificationIcon } from "../../utils/notification";

export type ToastProps = {
  id: string;
  title: string;
  message: {
    raw: string;
    parsed: MessageData;
  };
};

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

const Toast: FC<ToastProps> = ({ title, message }) => (
  <Stack data-cy={"notif-toast"}>
    <Stack direction="row" alignItems="center" gap={0.5}>
      {getNotificationIcon(message.parsed)}
      <Typography data-cy="toast-notification-title" variant="h6"> {title}</Typography>
    </Stack>

    <Typography data-cy="toast-notification-message" variant="body1">{createMessage(message)}</Typography>
  </Stack>
);

export const useToast = () => {
  const dispatch = useAppDispatch();
  const displayedToasts = useDisplayedToasts();

  const displayToast = useCallback(
    (props: ToastProps) => {
      if (!displayedToasts[props.id]) {
        toast(<Toast {...props} />, {
          position: "bottom-right",
          autoClose: 5000,
          closeOnClick: true,
          pauseOnHover: true,
          pauseOnFocusLoss: true,
        });

        dispatch(updateDisplayedToasts(props.id));
      }
    },
    [displayedToasts]
  );

  return displayToast;
};

export default Toast;
