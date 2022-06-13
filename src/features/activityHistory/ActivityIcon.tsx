import { Avatar, ListItemAvatar, SvgIcon } from "@mui/material";
import { FC } from "react";

interface ActivityIconProps {
  icon: typeof SvgIcon;
}

const ActivityIcon: FC<ActivityIconProps> = ({ icon: Icon }) => (
  <ListItemAvatar>
    <Avatar
      sx={{
        width: "40px",
        height: "40px",
        color: "text.secondary",
        backgroundColor: "transparent",
        border: "2px solid",
        borderColor: "text.secondary",
      }}
    >
      <Icon sx={{ fontSize: "20px" }} />
    </Avatar>
  </ListItemAvatar>
);

export default ActivityIcon;
