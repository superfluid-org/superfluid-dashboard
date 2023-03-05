import { Box, Stack, Typography } from "@mui/material";
import { FC } from "react";
import { NotificationTab } from "./NotificationsBell";

type NotificationHeaderProps = {
  activeTab: "new" | "archive";
  setActiveTab: (tab: NotificationTab) => void;
};

const NotificationHeader: FC<NotificationHeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <Stack
      p={2}
      direction="row"
      sx={{
        justifyContent: "space-between",
        alignItems: "center",
        background: "white",
        borderBottom: "1px solid #E0E0E0",
      }}
    >
      <Typography variant="h5">Notifications</Typography>
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
  );
};

export default NotificationHeader;
