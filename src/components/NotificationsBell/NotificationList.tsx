import { useTokenSearch } from "@lifi/widget/hooks";
import { Button, Divider, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { FC } from "react";
import NetworkBadge from "../../features/network/NetworkBadge";
import {
  allNetworks,
  findNetworkOrThrow,
} from "../../features/network/networks";

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

          <Stack p={2} justifyContent="center">
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
