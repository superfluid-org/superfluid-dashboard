import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import { FC, useEffect, useState, useMemo, ReactNode } from "react";
import { createSuperfluidMuiTheme } from "./theme";
import { useTheme as useThemeNextThemes } from "next-themes";

const MuiProvider: FC = ({ children }) => {
  const { theme: themeMode } = useThemeNextThemes();
  const [muiThemeMode, setMuiThemeMode] = useState<"light" | "dark">("light");

  const [mounted, setMounted] = useState(false);

  const muiTheme = useMemo(
    () => createSuperfluidMuiTheme(muiThemeMode),
    [muiThemeMode]
  );

  useEffect(() => {
    setMounted(true);
    setMuiThemeMode(themeMode);
  }, [themeMode]);

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ ...(!mounted ? { display: "none" } : {}) }}>{children}</Box>
    </ThemeProvider>
  );
};

export default MuiProvider;
