import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";
import AutoAwesomeMosaicRoundedIcon from "@mui/icons-material/AutoAwesomeMosaicRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ImportContactsRoundedIcon from "@mui/icons-material/ImportContactsRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  SvgIcon,
  SwipeableDrawer,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FC, memo, useCallback } from "react";
import { useAccount } from "wagmi";
import Link from "../common/Link";
import ThemeChanger from "../theme/ThemeChanger";
import ConnectWallet from "../wallet/ConnectWallet";
import { useLayoutContext } from "./LayoutContext";
import MoreNavigationItem from "./MoreNavigationItem";

export const menuDrawerWidth = 260;

interface NavigationItemProps {
  id: string;
  title: string;
  href: string;
  active: boolean;
  icon: typeof SvgIcon;
  onClick?: () => void;
}

const NavigationItem: FC<NavigationItemProps> = ({
  id,
  title,
  href,
  active,
  icon: Icon,
  onClick,
}) => (
  <NextLink href={href} passHref>
    <ListItemButton
      sx={{ borderRadius: "10px" }}
      selected={active}
      onClick={onClick}
    >
      <ListItemIcon>
        <Icon />
      </ListItemIcon>
      <ListItemText data-cy={id} primary={title} />
    </ListItemButton>
  </NextLink>
);

export default memo(function NavigationDrawer() {
  const theme = useTheme();
  const router = useRouter();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const { navigationDrawerOpen, setNavigationDrawerOpen } = useLayoutContext();

  const closeNavigationDrawer = useCallback(() => {
    if (isSmallScreen) setNavigationDrawerOpen(false);
  }, [isSmallScreen, setNavigationDrawerOpen]);

  const openNavigationDrawer = useCallback(() => {
    if (isSmallScreen) setNavigationDrawerOpen(true);
  }, [isSmallScreen, setNavigationDrawerOpen]);

  const isActiveRoute = (...routes: Array<string>) =>
    routes.includes(router.route);

  return (
    <SwipeableDrawer
      data-cy={"navigation-drawer"}
      variant={isSmallScreen ? "temporary" : "permanent"} // permanent
      open={navigationDrawerOpen}
      anchor="left"
      disableDiscovery={true}
      disableSwipeToOpen={true}
      PaperProps={{
        sx: {
          width: menuDrawerWidth,
          borderRadius: 0,
          borderLeft: 0,
          borderTop: 0,
          borderBottom: 0,
        },
      }}
      sx={{ width: menuDrawerWidth }}
      onClose={closeNavigationDrawer}
      onOpen={openNavigationDrawer}
    >
      <Toolbar sx={{ height: 88 }}>
        <Link href="/">
          <Image
            data-cy={"superfluid-logo"}
            priority
            unoptimized
            src={
              theme.palette.mode === "dark"
                ? "/superfluid-logo-light.svg"
                : "/superfluid-logo-dark.svg"
            }
            width={167}
            height={40}
            layout="fixed"
            alt="Superfluid logo"
          />
        </Link>
      </Toolbar>

      <Box sx={{ px: 2, py: 1.5 }}>
        <ConnectWallet />
      </Box>

      <Stack
        component={List}
        sx={{ color: theme.palette.text.secondary, px: 2 }}
        gap={1}
      >
        <NavigationItem
          id="nav-dashboard"
          title="Dashboard"
          href="/"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/", "/[_network]/token")}
          icon={AutoAwesomeMosaicRoundedIcon}
        />

        <NavigationItem
          id="nav-wrap-unwrap"
          title="Wrap / Unwrap"
          href="/wrap?upgrade"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/wrap")}
          icon={SwapVertRoundedIcon}
        />

        <NavigationItem
          id="nav-send"
          title="Send Stream"
          href="/send"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/send")}
          icon={ArrowRightAltRoundedIcon}
        />

        <NavigationItem
          id="nav-history"
          title="Activity History"
          href="/history"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/history")}
          icon={HistoryRoundedIcon}
        />

        <NavigationItem
          id="nav-address-book"
          title="Address Book"
          href="/address-book"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/address-book")}
          icon={ImportContactsRoundedIcon}
        />

        <NavigationItem
          id="nav-ecosystem"
          title="Ecosystem"
          href="/ecosystem"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/ecosystem")}
          icon={AppsRoundedIcon}
        />
      </Stack>

      <Stack justifyContent="flex-end" sx={{ flex: 1 }}>
        <Stack
          sx={{ my: 2, px: 2, color: theme.palette.text.secondary }}
          gap={1}
        >
          <MoreNavigationItem />
          <ThemeChanger />
        </Stack>
      </Stack>
    </SwipeableDrawer>
  );
});
