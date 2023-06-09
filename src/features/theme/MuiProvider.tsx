import { Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { Theme, ThemeProvider } from "@mui/material/styles";
import { useTheme as useThemeNextThemes } from "next-themes";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { buildTheme } from "./theme";

const LIGHT_THEME = buildTheme("light");
const DARK_THEME = buildTheme("dark");

const MuiProvider: FC<{ children: (theme: Theme) => ReactNode }> = ({
  children,
}) => {
  const { theme: themeMode } = useThemeNextThemes();
  const [muiThemeMode, setMuiThemeMode] = useState<"light" | "dark">("light");

  const [mounted, setMounted] = useState(false);

  const muiTheme = useMemo(
    () => (muiThemeMode === "dark" ? DARK_THEME : LIGHT_THEME),
    [muiThemeMode]
  );

  useEffect(() => {
    setMounted(true);
    setMuiThemeMode(themeMode as "light" | "dark");
  }, [themeMode]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ ...(!mounted ? { display: "none" } : {}) }}>
        {children(muiTheme)}
      </Box>
    </ThemeProvider>
  );
};

export default MuiProvider;
