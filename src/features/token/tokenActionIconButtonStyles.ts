import { alpha } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";

export const tokenActionIconButtonSx: SxProps<Theme> = (theme) => ({
  width: 36,
  height: 36,
  borderRadius: "10px",
  color: theme.palette.primary.main,
  bgcolor: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
  transition: theme.transitions.create(
    ["background-color", "border-color", "transform"],
    {
      duration: theme.transitions.duration.shorter,
      easing: theme.transitions.easing.easeOut,
    }
  ),
  "& .MuiSvgIcon-root": {
    fontSize: 20,
    stroke: "currentColor",
    strokeWidth: 0.55,
  },
  "&:hover": {
    bgcolor: alpha(theme.palette.primary.main, 0.18),
    borderColor: alpha(theme.palette.primary.main, 0.28),
    transform: "translateY(-1px)",
  },
  "&:focus-visible": {
    outline: `2px solid ${alpha(theme.palette.primary.main, 0.45)}`,
    outlineOffset: 2,
  },
  "@media (prefers-reduced-motion: reduce)": {
    transition: "none",
  },
});
