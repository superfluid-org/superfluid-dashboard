import { Box, createTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { useTheme as useThemeNextThemes } from "next-themes";
import { FC, useEffect, useMemo, useState } from "react";
import { getDesignTokens, getThemedComponents } from "./theme";

const MuiProvider: FC = ({ children }) => {
  const { theme: themeMode } = useThemeNextThemes();
  const [muiThemeMode, setMuiThemeMode] = useState<"light" | "dark">("light");

  const [mounted, setMounted] = useState(false);

  const muiTheme = useMemo(() => {
    const themeCreate = createTheme(getDesignTokens(muiThemeMode));
    return deepmerge(themeCreate, getThemedComponents(themeCreate));
  }, [muiThemeMode]);

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
