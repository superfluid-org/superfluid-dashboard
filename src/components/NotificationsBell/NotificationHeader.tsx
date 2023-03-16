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
import { FC } from "react";
import { NotificationTab } from "./NotificationsBell";

type NotificationHeaderProps = {
  activeTab: NotificationTab;
  setActiveTab: (tab: NotificationTab) => void;
};

const NotificationHeader: FC<NotificationHeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <>
      <Stack px={2} pt={2} gap={1}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5">Notifications</Typography>
          <Link href="/settings">
            <Tooltip title="Open Settings">
              <IconButton size="small">
                <SettingsIcon sx={{ ycolor: "GrayText" }} />
              </IconButton>
            </Tooltip>
          </Link>
        </Stack>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ minHeight: "inherit" }}
        >
          <Tab
            value="new"
            label="New"
            sx={{
              fontSize: 12,
              minHeight: "inherit",
              padding: 1,
            }}
          />
          <Tab
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
