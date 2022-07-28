import { GlobalStyles, useMediaQuery, useTheme } from "@mui/material";
import { FC, ReactElement, useEffect } from "react";
import { useIntercom } from "react-use-intercom";
import config from "../../utils/config";
import { useLayoutContext } from "../layout/LayoutContext";
import { transactionDrawerWidth } from "../transactionDrawer/TransactionDrawer";

interface IntercomHandlerProps {
  children: ReactElement<any, any>;
}

const IntercomHandler: FC<IntercomHandlerProps> = ({ children }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { transactionDrawerOpen } = useLayoutContext();
  const { boot, update, shutdown } = useIntercom();

  useEffect(() => {
    if (!config.intercom.appId) console.warn("Intercom not initialized.");

    if (isBelowMd) {
      return shutdown();
    }

    boot({
      horizontalPadding: 24,
      verticalPadding: 24,
      alignment: "right",
    });
  }, [boot, shutdown, isBelowMd]);

  useEffect(() => {
    const isDarkMode = theme.palette.mode === "dark";

    update({
      actionColor: isDarkMode ? " #1c1d20" : theme.palette.primary.main,
      backgroundColor: isDarkMode ? " #1c1d20" : theme.palette.primary.main,
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
