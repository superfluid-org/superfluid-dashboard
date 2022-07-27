import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import { Fab, useMediaQuery, useTheme } from "@mui/material";
import { FC, useEffect } from "react";
import { useIntercom } from "react-use-intercom";
import { useLayoutContext } from "../layout/LayoutContext";
import { menuDrawerWidth } from "../layout/NavigationDrawer";
import { transactionDrawerWidth } from "../transactionDrawer/TransactionDrawer";

export const INTERCOM_APP_ID = process.env.NEXT_PUBLIC_INTERCOM_APP_ID || "";

const INTERCOM_ANCHOR_ID = "intercom-fab";

const IntercomButton: FC = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { transactionDrawerOpen } = useLayoutContext();
  const { boot, update } = useIntercom();

  const isDarkMode = theme.palette.mode === "dark";

  useEffect(() => {
    if (!INTERCOM_APP_ID) console.warn("Intercom not initialized.");

    boot({
      customLauncherSelector: `#${INTERCOM_ANCHOR_ID}`,
      hideDefaultLauncher: true,
      horizontalPadding: 24,
      verticalPadding: 84,
      alignment: "right",
    });
  }, [boot]);

  useEffect(() => {
    update({
      actionColor: isDarkMode ? " #1c1d20" : theme.palette.primary.main,
      backgroundColor: isDarkMode ? " #1c1d20" : theme.palette.primary.main,
      horizontalPadding:
        24 + (transactionDrawerOpen ? transactionDrawerWidth : 0),
    });
  }, [update, transactionDrawerOpen, isDarkMode, theme]);

  // TODO: Intercom should be added somewhere into sidebar in mobile views.
  if (!INTERCOM_APP_ID || isBelowMd) return null;

  return (
    <Fab
      id={INTERCOM_ANCHOR_ID}
      color="primary"
      sx={{
        position: "fixed",
        bottom: 16,
        right: 24 + (transactionDrawerOpen ? transactionDrawerWidth : 0),
        color: "white",
        transition: theme.transitions.create("right", {
          easing: theme.transitions.easing.easeInOut,
          duration: theme.transitions.duration.standard,
        }),
      }}
    >
      <ChatRoundedIcon />
    </Fab>
  );
};

export default IntercomButton;
