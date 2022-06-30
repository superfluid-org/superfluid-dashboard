import { useMediaQuery, useTheme } from "@mui/material";

export default function useMediaBreakpoints() {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down("md"));

  return {
    isPhone,
  };
}
