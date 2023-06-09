import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { SvgIcon, useTheme } from "@mui/material";
import { FC } from "react";

interface OpenIconProps {
  open: boolean;
  clockwise?: boolean;
  icon?: typeof SvgIcon;
}

const OpenIcon: FC<OpenIconProps> = ({
  open,
  clockwise = false,
  icon: Icon = ExpandMoreRoundedIcon,
}) => {
  const theme = useTheme();

  return (
    <Icon
      sx={{
        transform: `rotate(${open ? 180 * (clockwise ? -1 : 1) : 0}deg)`,
        transition: theme.transitions.create("transform", {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.short,
        }),
      }}
    />
  );
};

export default OpenIcon;
