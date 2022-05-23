import { DarkModeOutlined, LightModeOutlined } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import { useTheme as useThemeNextThemes } from "next-themes";
import { useTheme as useThemeMui } from "@mui/material";

export default function ThemeChanger() {
  const { setTheme } = useThemeNextThemes();
  const muiTheme = useThemeMui();

  const isDarkTheme = muiTheme.palette.mode === "dark";

  const toggleTheme = () => setTheme(isDarkTheme ? "light" : "dark");

  return (
    <Tooltip title={isDarkTheme ? "Light mode" : "Dark mode"}>
      <IconButton onClick={toggleTheme}>
        {isDarkTheme ? (
          <LightModeOutlined fontSize="small" />
        ) : (
          <DarkModeOutlined fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
