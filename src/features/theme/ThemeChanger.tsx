import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { IconButton, Tooltip, useTheme as useThemeMui } from "@mui/material";
import { useTheme as useThemeNextThemes } from "next-themes";

export default function ThemeChanger() {
  const { setTheme } = useThemeNextThemes();
  const muiTheme = useThemeMui();

  const isDarkTheme = muiTheme.palette.mode === "dark";

  const toggleTheme = () => setTheme(isDarkTheme ? "light" : "dark");

  return (
    <Tooltip data-cy={"light-switch"} title={isDarkTheme ? "Light mode" : "Dark mode"}>
      <IconButton color="inherit" onClick={toggleTheme}>
        {isDarkTheme ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}
