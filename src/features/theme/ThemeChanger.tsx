import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import {
  IconButton,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme as useThemeMui,
} from "@mui/material";
import { useTheme as useThemeNextThemes } from "next-themes";

export default function ThemeChanger() {
  const { setTheme } = useThemeNextThemes();
  const muiTheme = useThemeMui();

  const isDarkTheme = muiTheme.palette.mode === "dark";

  const toggleTheme = () => setTheme(isDarkTheme ? "light" : "dark");

  return (
    <ListItemButton sx={{ borderRadius: "10px" }} onClick={toggleTheme}>
      <ListItemIcon>
        {isDarkTheme ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </ListItemIcon>
      <ListItemText primary={isDarkTheme ? "Light mode" : "Dark mode"} />
    </ListItemButton>
  );
}
