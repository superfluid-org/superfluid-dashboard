import { ThemeProvider as ThemeProviderMui } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, Theme } from "@mui/material";
import { FC, useEffect, useState, useMemo, ReactNode } from "react";
import { createSuperfluidMuiTheme } from "../theme";
import { useTheme as useThemeNextThemes } from "next-themes";

const Mui: FC<{ children: (muiTheme: Theme) => ReactNode}> = ({ children }) => {
  const { theme: themeMode } = useThemeNextThemes();
  const [muiThemeMode, setMuiThemeMode] = useState<"light" | "dark">("light");

  const [mounted, setMounted] = useState(false);

  const muiTheme = useMemo(
    () => createSuperfluidMuiTheme(muiThemeMode),
    [muiThemeMode]
  );

  useEffect(() => {
    setMounted(true), setMuiThemeMode(themeMode);
  }, [themeMode]);

  return (
    <ThemeProviderMui theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ ...(!mounted ? { display: "none" } : {}) }}>{children(muiTheme)}</Box>
    </ThemeProviderMui>
  );
};

export default Mui;
