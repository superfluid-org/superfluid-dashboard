import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useTheme as useThemeNextThemes } from 'next-themes'
import { useTheme as useThemeMui } from '@mui/material'

export default function ThemeChanger() {
  const { setTheme } = useThemeNextThemes()
  const muiTheme = useThemeMui()

  const isDarkTheme = (muiTheme.palette.mode === "dark");

  return (
    <Tooltip title={isDarkTheme ? 'Light mode' : 'Dark mode'}>
      <IconButton color="primary" onClick={() => isDarkTheme ? setTheme("light") : setTheme("dark")}>
        {isDarkTheme ? (
          <LightModeOutlined fontSize="small" />
        ) : (
          <DarkModeOutlined fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}