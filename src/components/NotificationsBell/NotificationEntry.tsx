import { Box, Button, colors, Divider, Stack, Typography } from "@mui/material";
import { FC } from "react";
import { NextLinkComposed } from "../../features/common/Link";
import NetworkBadge from "../../features/network/NetworkBadge";
import {
  allNetworks,
  findNetworkOrThrow,
} from "../../features/network/networks";
import { Notification } from "../../hooks/useNotificationChannels";
import { createMessage, getNotificationIcon } from "../../utils/notification";
import { getWrapPagePath } from "../../utils/URLUtils";
import { NotificationTab } from "./NotificationsBell";
import isAfter from "date-fns/isAfter";

type NotificationProps = {
  notification: Notification;
  type: NotificationTab;
  seen: boolean;
  archive: (notificationId: string) => () => void;
};

const Dot: FC = () => (
  <Box
    sx={{
      width: 8,
      height: 8,
      borderRadius: 50,
      backgroundColor: colors.blue[500],
    }}
  />
);

const NotificationEntry: FC<NotificationProps> = ({
  notification,
  type,
  seen,
  archive,
}) => {
  return (
    <Stack
      sx={{
        position: "relative",
        "&:hover, &:active": {
          ".archive-cta": {
            maxHeight: 50,
          },
        },
      }}
    >
      {notification.message.parsed.network && (
        <NetworkBadge
          sx={{ position: "absolute", top: 0, right: 22 }}
          NetworkIconProps={{
            size: 20,
            fontSize: 16,
          }}
          network={findNetworkOrThrow(
            allNetworks,
            notification.message.parsed.network
          )}
        />
      )}

      <Stack p={2} justifyContent="center">
        <Stack direction="row" gap={0.5}>
          {!seen && type === "new" && (
            <Box py={1}>
              <Dot />
            </Box>
          )}

          <Box sx={{ filter: type === "archive" ? "opacity(70%)" : "none" }}>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" alignItems="center" gap={0.5}>
                {getNotificationIcon(notification.message.parsed)}
                <Typography variant="h6"> {notification.title}</Typography>
              </Stack>
            </Stack>
            <Stack pl={3.5} gap={1}>
              <Typography variant="body2" sx={{ color: "GrayText" }}>
                {createMessage(notification.message)}
              </Typography>
            </Stack>
          </Box>
        </Stack>

        <Box px={seen ? 3 : 4.5} pt={1}>
          {type === "new" &&
            notification.message.parsed.type &&
            notification.message.parsed.type.includes("liquidation-risk") &&
            isAfter(
              Number(notification.message.parsed.liquidation) * 1000,
              Date.now()
            ) && (
              <NextLinkComposed
                passHref={true}
                to={getWrapPagePath({
                  network: notification.message.parsed.network,
                  token: notification.message.parsed.tokenAddress,
                })}
              >
                <Button sx={{ width: 120 }} variant="contained">
                  Wrap tokens
                </Button>
              </NextLinkComposed>
            )}
        </Box>
      </Stack>
      {type === "new" && (
        <Stack
          sx={{
            maxHeight: 0,
            overflow: "hidden",
            transition: "max-height .5s",
          }}
          className="archive-cta"
        >
          <Divider />
          <Button sx={{ borderRadius: 0 }} onClick={archive(notification.id)}>
            Archive
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default NotificationEntry;
