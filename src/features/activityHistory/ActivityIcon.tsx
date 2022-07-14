import { Avatar, ListItemAvatar, styled, SvgIcon } from "@mui/material";
import { FC } from "react";

const ActivityIconWrapper = styled(Avatar)(({ theme }) => ({
  width: "40px",
  height: "40px",
  backgroundColor: "transparent",
  border: "2px solid",
  color: theme.palette.text.secondary,
  borderColor: theme.palette.text.secondary,
  [theme.breakpoints.down("md")]: {
    width: "32px",
    height: "32px",
  },
}));

interface ActivityIconProps {
  icon: typeof SvgIcon;
}

const ActivityIcon: FC<ActivityIconProps> = ({ icon: Icon }) => (
  <ListItemAvatar>
    <ActivityIconWrapper>
      <Icon
        sx={{
          fontSize: "20px",
        }}
      />
    </ActivityIconWrapper>
  </ListItemAvatar>
);

export default ActivityIcon;
