import {
  Avatar,
  ListItemAvatar,
  styled,
  SvgIcon,
  SvgIconProps,
} from "@mui/material";
import { FC } from "react";

const ActivityIconWrapper = styled(Avatar)(({ theme }) => ({
  width: "40px",
  height: "40px",
  backgroundColor: "transparent",
  border: "2px solid",
  color: theme.palette.text.secondary,
  borderColor: theme.palette.other.outline,
  [theme.breakpoints.down("md")]: {
    width: "32px",
    height: "32px",
  },
}));

interface ActivityIconProps {
  icon: typeof SvgIcon;
  IconProps?: Partial<SvgIconProps>;
}

const ActivityIcon: FC<ActivityIconProps> = ({
  icon: Icon,
  IconProps = { sx: {} },
}) => (
  <ListItemAvatar>
    <ActivityIconWrapper>
      <Icon
        {...IconProps}
        sx={{
          fontSize: "20px",
          ...IconProps.sx,
        }}
      />
    </ActivityIconWrapper>
  </ListItemAvatar>
);

export default ActivityIcon;
