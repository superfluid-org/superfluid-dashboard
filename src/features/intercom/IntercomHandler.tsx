import { GlobalStyles, useMediaQuery, useTheme } from "@mui/material";
import { FC, ReactElement, ReactNode, useEffect } from "react";
import { useIntercom } from "react-use-intercom";
import config from "../../utils/config";
import { useLayoutContext } from "../layout/LayoutContext";
import { transactionDrawerWidth } from "../transactionDrawer/TransactionDrawer";

interface IntercomHandlerProps {
  children: ReactNode;
}

const IntercomHandler: FC<IntercomHandlerProps> = ({ children }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { transactionDrawerOpen } = useLayoutContext();
  const { boot, update, hide } = useIntercom();

  useEffect(() => {
    if (!config.intercom.appId) console.warn("Intercom not initialized.");

    boot({
      horizontalPadding: 24,
      verticalPadding: 24,
      alignment: "right",
    });
  }, [boot]);

  useEffect(() => {
    const isDarkMode = theme.palette.mode === "dark";
    if (isBelowMd) hide();

    update({
      hideDefaultLauncher: isBelowMd,
      actionColor: isDarkMode
        ? theme.palette.other.intercom
        : theme.palette.primary.main,
      backgroundColor: isDarkMode
        ? theme.palette.other.intercom
        : theme.palette.primary.main,
      horizontalPadding:
        24 + (transactionDrawerOpen ? transactionDrawerWidth : 0),
    });
  }, [update, transactionDrawerOpen, theme, isBelowMd]);

  // TODO: Intercom should be added somewhere into sidebar in mobile views.

  return (
    <>
      <GlobalStyles
        styles={{
          ".intercom-launcher": {
            transition: theme.transitions.create("right", {
              easing: theme.transitions.easing.easeInOut,
              duration: theme.transitions.duration.standard,
            }),
          },
          "#intercom-container": {
            ".intercom-launcher-frame, .intercom-messenger-frame, .intercom-borderless-frame":
              {
                transition: theme.transitions.create(
                  ["width", "height", "max-height", "right"],
                  {
                    easing: theme.transitions.easing.easeInOut,
                    duration: theme.transitions.duration.standard,
                  }
                ),
              },
          },
        }}
      />
      {children}
    </>
  );
};

export default IntercomHandler;
