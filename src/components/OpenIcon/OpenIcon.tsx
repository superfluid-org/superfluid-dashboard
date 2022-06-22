import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { styled } from "@mui/material";

interface OpenIconProps {
  open: boolean;
}

export const OpenIcon = styled(ExpandMoreRoundedIcon)<OpenIconProps>(
  ({ theme, open }) => ({
    transform: `rotate(${open ? 180 : 0}deg)`,
    transition: theme.transitions.create("transform", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.short,
    }),
  })
);
