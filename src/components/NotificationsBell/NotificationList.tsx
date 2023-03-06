import {
  Box,
  colors,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import format from "date-fns/format";
import Link from "next/link";
import { FC } from "react";
import NetworkIcon from "../../features/network/NetworkIcon";
import {
  allNetworks,
  findNetworkOrThrow,
} from "../../features/network/networks";
import { useSeenNotifications } from "../../features/notifications/notifactionHooks";
import { markAsSeen } from "../../features/notifications/notifications.slice";
import { useAppDispatch } from "../../features/redux/store";
import { MessageData, Notification } from "../../hooks/useNotificationChannels";
import InfoIcon from "@mui/icons-material/Info";
import ReportIcon from "@mui/icons-material/Report";
import { capitalize } from "lodash";

type NotificationListProps = {
  notifications: {
    new: Notification[];
    archive: Notification[];
  };
  activeTab: "new" | "archive";
};

const getIcon = ({ type }: MessageData) => {
  switch (type) {
    case "liquidation":
      return (
        <InfoIcon fontSize="small" sx={{ color: colors.lightBlue[500] }} />
      );
    case "liquidation-risk-2day":
      return <ReportIcon fontSize="small" sx={{ color: colors.red[500] }} />;
    case "liquidation-risk-7day":
      return <ReportIcon fontSize="small" sx={{ color: colors.amber[500] }} />;
  }
};

const createLiquidationRiskMessage = ({
  token,
  symbol,
  network,
  liquidation,
}: MessageData) =>
  `Your ${token}(${symbol}) on ${capitalize(
    network
  )} is about to be liquidated${
    liquidation
      ? " at " + format(Number(liquidation) * 1000, "yyyy/MM/dd HH:mm")
      : ""
  }.`;

const createLiquidatedMessage = ({
  network,
  token,
  symbol,
  liquidation,
}: MessageData) =>
  `Your ${token}(${symbol}) on ${capitalize(network)} was liquidated${
    liquidation
      ? " at " + format(Number(liquidation) * 1000, "yyyy/MM/dd HH:mm")
      : ""
  }.`;

const NotificationList: FC<NotificationListProps> = ({
  notifications,
  activeTab,
}) => {
  const seen = useSeenNotifications();

  const dispatch = useAppDispatch();

  const onMarkAsSeen = (id: string) => () => {
    dispatch(markAsSeen(id));
  };

  return notifications[activeTab].length > 0 ? (
    <>
      {notifications[activeTab].map(({ id, title, message }) => (
        <Stack key={id}>
          <Tooltip
            followCursor
            title={seen[id] ? "" : "Click to archive"}
            sx={{ zIndex: 10000 }}
          >
            <Stack
              onClick={onMarkAsSeen(id)}
              p={2}
              sx={{
                cursor: "pointer",
                ":hover": {
                  background: colors.grey[100],
                },
                justifyContent: "center",
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={0.5}>
                  {getIcon(message)}
                  <Typography variant="h6"> {title}</Typography>
                </Stack>

                {message.network && (
                  <NetworkIcon
                    network={findNetworkOrThrow(allNetworks, message.network)}
                    size={24}
                  />
                )}
              </Stack>
              <Typography variant="body2">
                {message.type === "liquidation"
                  ? createLiquidatedMessage(message)
                  : createLiquidationRiskMessage(message)}
              </Typography>
            </Stack>
          </Tooltip>
          <Divider />
        </Stack>
      ))}
    </>
  ) : (
    <Typography variant="body1" p={1.5}>
      No {activeTab} notifications found. <br /> Check{" "}
      <Link href="/settings">settings</Link> to see if you are subscribed.
    </Typography>
  );
};

export default NotificationList;
