import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { IconButton, Tooltip, useTheme as useThemeMui } from "@mui/material";
import { useTheme as useThemeNextThemes } from "next-themes";

export default function ThemeChanger() {
  const { setTheme } = useThemeNextThemes();
  const muiTheme = useThemeMui();

  const isDarkTheme = muiTheme.palette.mode === "dark";

  const toggleTheme = () => setTheme(isDarkTheme ? "light" : "dark");

  const title = isDarkTheme ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Tooltip title={title}>
      <IconButton
        data-cy={isDarkTheme ? "light-mode-button" : "dark-mode-button"}
        size="small"
        onClick={toggleTheme}
        aria-label={title}
      >
        {isDarkTheme ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
