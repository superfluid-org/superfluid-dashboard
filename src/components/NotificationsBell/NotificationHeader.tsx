import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import { Divider, Stack, Tooltip, Typography } from "@mui/material";
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
      <Stack p={2} gap={1}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h5">Notifications</Typography>
          <Link href="/settings">
            <Tooltip title="Open Settings">
              <SettingsIcon sx={{ cursor: "pointer", color: "GrayText" }} />
            </Tooltip>
          </Link>
        </Stack>
        <Stack direction="row" gap={1}>
          <Typography
            variant="body2"
            sx={{
              textDecoration: activeTab === "new" ? "underline" : "none",
              cursor: "pointer",
              color: activeTab === "new" ? "ButtonText" : "GrayText",
            }}
            onClick={() => setActiveTab("new")}
          >
            New
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textDecoration: activeTab === "archive" ? "underline" : "none",
              cursor: "pointer",
              color: activeTab === "archive" ? "ButtonText" : "GrayText",
            }}
            onClick={() => setActiveTab("archive")}
          >
            Archive
          </Typography>
        </Stack>
      </Stack>
      <Divider />
    </>
  );
};

export default NotificationHeader;
