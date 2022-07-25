import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import { Fab, useMediaQuery, useTheme } from "@mui/material";
import { FC, useEffect } from "react";
import { useIntercom } from "react-use-intercom";
import config from "../../utils/config";
import { menuDrawerWidth } from "../layout/NavigationDrawer";

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
    if (!config.intercom.appId) console.warn("Intercom not initialized.");

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
  if (!config.intercom.appId || isBelowMd) return null;

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
