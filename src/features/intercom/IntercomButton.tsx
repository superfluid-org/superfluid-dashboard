import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import { Fab, useMediaQuery, useTheme } from "@mui/material";
import { FC, useEffect, useMemo } from "react";
import { useIntercom } from "react-use-intercom";
import { menuDrawerWidth } from "../layout/NavigationDrawer";

export const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || "";

const INTERCOM_ANCHOR_ID = "intercom-fab";

const IntercomButton: FC = () => {
  const {
    palette: {
      mode: themeMode,
      primary: { main: primaryColor },
    },
    breakpoints,
  } = useTheme();
  const isBelowMd = useMediaQuery(breakpoints.down("md"));

  const { boot, update } = useIntercom();

  const isDarkMode = themeMode === "dark";

  useEffect(() => {
    if (!INTERCOM_APP_ID) console.warn("Intercom not initialized.");

    boot({
      customLauncherSelector: `#${INTERCOM_ANCHOR_ID}`,
      hideDefaultLauncher: true,
      horizontalPadding: menuDrawerWidth + 24,
      verticalPadding: 84,
      alignment: "left",
    });
  }, [boot]);

  useEffect(() => {
    update({
      actionColor: isDarkMode ? " #1c1d20" : primaryColor,
      backgroundColor: isDarkMode ? " #1c1d20" : primaryColor,
    });
  }, [update, isDarkMode, primaryColor]);

  // TODO: Intercom should be added somewhere into sidebar in mobile views.
  if (!INTERCOM_APP_ID || isBelowMd) return null;

  return (
    <Fab
      id={INTERCOM_ANCHOR_ID}
      color="primary"
      sx={{
        position: "fixed",
        bottom: 16,
        left: menuDrawerWidth + 24,
        color: "white",
      }}
    >
      <ChatRoundedIcon />
    </Fab>
  );
};

export default IntercomButton;
