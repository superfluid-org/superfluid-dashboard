import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import {
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { NextLinkComposed } from "../../features/common/Link";
import { NotificationTab } from "./NotificationsBell";

type NotificationHeaderProps = {
  activeTab: NotificationTab;
  setActiveTab: (tab: NotificationTab) => void;
};

const NotificationHeader: FC<NotificationHeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  // Without delay, the active tab's underline renders weirdly inside the popover...
  const [delayedActiveTabRender, setDelayedActiveTabRender] =
    useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedActiveTabRender(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Stack px={2} pt={2} gap={1}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">Notifications</Typography>
          <NextLinkComposed passHref={true} to="/settings">
            <Tooltip title="Open Settings">
              <IconButton size="medium">
                <SettingsIcon sx={{ ycolor: "GrayText" }} />
              </IconButton>
            </Tooltip>
          </NextLinkComposed>
        </Stack>
        <Tabs
          value={delayedActiveTabRender ? activeTab : false}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ minHeight: "inherit" }}
        >
          <Tab
            data-cy={"new-tab"}
            value="new"
            label="New"
            sx={{
              fontSize: 12,
              minHeight: "inherit",
              padding: 1,
            }}
          />
          <Tab
            data-cy={"archive-tab"}
            value="archive"
            label="Archive"
            sx={{
              fontSize: 12,
              minHeight: "inherit",
              padding: 1,
            }}
          />
        </Tabs>
      </Stack>
      <Divider />
    </>
  );
};

export default NotificationHeader;
