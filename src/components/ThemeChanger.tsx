import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from 'next-themes'

export default function ThemeChanger() {
  const { theme, setTheme } = useTheme()

  const isDarkTheme = (theme === "dark");

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