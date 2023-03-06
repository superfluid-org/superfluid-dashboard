import {
  Box,
  Button,
  colors,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { FC } from "react";
import NetworkBadge from "../../features/network/NetworkBadge";
import NetworkIcon from "../../features/network/NetworkIcon";
import {
  allNetworks,
  findNetworkOrThrow,
} from "../../features/network/networks";

import { useAppDispatch } from "../../features/redux/store";
import WrapCard from "../../features/tokenWrapping/WrapCard";
import { Notification } from "../../hooks/useNotificationChannels";

import { createMessage, getNotificationIcon } from "../../utils/notification";
import { NotificationTab } from "./NotificationsBell";

type NotificationListProps = {
  notifications: {
    new: Notification[];
    archive: Notification[];
  };
  activeTab: NotificationTab;
};

const NotificationList: FC<NotificationListProps> = ({
  notifications,
  activeTab,
}) => {
  return notifications[activeTab].length > 0 ? (
    <>
      {notifications[activeTab].map(({ id, title, message }) => (
        <Stack key={id} sx={{ position: "relative" }}>
          {message.parsed.network && (
            <NetworkBadge
              sx={{ position: "absolute", top: 0, right: 20 }}
              NetworkIconProps={{
                size: 16,
              }}
              network={findNetworkOrThrow(allNetworks, message.parsed.network)}
            />
          )}

          <Tooltip followCursor title="Placeholder" sx={{ zIndex: 10000 }}>
            <Stack
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
                  {getNotificationIcon(message.parsed)}
                  <Typography variant="h6"> {title}</Typography>
                </Stack>
              </Stack>
              <Stack pl={3} gap={1}>
                <Typography variant="body2" sx={{ color: "GrayText" }}>
                  {createMessage(message)}
                </Typography>
                {activeTab === "new" &&
                  message.parsed.type &&
                  message.parsed.type.includes("liquidation-risk") && (
                    <Link href="/wrap">
                      <Button sx={{ width: 120 }} variant="contained">
                        Wrap tokens
                      </Button>
                    </Link>
                  )}
              </Stack>
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
