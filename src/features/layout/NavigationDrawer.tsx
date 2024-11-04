import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import ArrowRightAltRoundedIcon from "@mui/icons-material/ArrowRightAltRounded";
import AutoAwesomeMosaicRoundedIcon from "@mui/icons-material/AutoAwesomeMosaicRounded";
import AutoStoriesOutlinedIcon from "@mui/icons-material/AutoStoriesOutlined";
import ControlPointDuplicateOutlinedIcon from "@mui/icons-material/ControlPointDuplicateOutlined";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import LooksRoundedIcon from "@mui/icons-material/LooksRounded";
import SettingsIcon from "@mui/icons-material/Settings";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import {
  Box,
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
import Image from "next/legacy/image";
import { useRouter } from "next/router";
import { FC, memo, useCallback } from "react";
import ThemeChanger from "../theme/ThemeChanger";
import ConnectWallet from "../wallet/ConnectWallet";
import { useLayoutContext } from "./LayoutContext";
import MoreNavigationItem from "./MoreNavigationItem";
import Link from "../common/Link";

export const menuDrawerWidth = 260;

interface NavigationItemProps {
  id: string;
  title: string;
  href: string;
  active: boolean;
  icon: typeof SvgIcon;
  isExternal?: true;
  onClick?: () => void;
}

const NavigationItem: FC<NavigationItemProps> = ({
  id,
  title,
  href,
  active,
  icon: Icon,
  isExternal,
  onClick,
}) => {
  const theme = useTheme();

  return (
    <ListItemButton
        LinkComponent={Link}
        href={href}
        sx={{
        borderRadius: "10px",
        transition: theme.transitions.create("background-color", {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.short,
        }),
      }}
      selected={active}
      onClick={onClick}
      {...(isExternal && { target: "_blank" })}
      >
        <ListItemIcon>
          <Icon />
        </ListItemIcon>
        <ListItemText data-cy={id} primary={<>{title} {isExternal && <OpenInNewRoundedIcon fontSize="inherit" />}</>} />
      </ListItemButton>
    );
  };

export default memo(function NavigationDrawer() {
  const theme = useTheme();
  const isBelowLg = useMediaQuery(theme.breakpoints.down("lg"));
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { navigationDrawerOpen, setNavigationDrawerOpen } = useLayoutContext();

  const closeNavigationDrawer = useCallback(() => {
    if (isBelowLg) setNavigationDrawerOpen(false);
  }, [isBelowLg, setNavigationDrawerOpen]);

  const openNavigationDrawer = useCallback(() => {
    if (isBelowLg) setNavigationDrawerOpen(true);
  }, [isBelowLg, setNavigationDrawerOpen]);

  const router = useRouter();
  const isActiveRoute = (...routes: Array<string>) =>
    routes.includes(router.route);

  return (
    <SwipeableDrawer
      data-cy={"navigation-drawer"}
      variant={isBelowLg ? "temporary" : "permanent"} // permanent
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
        style: {
          pointerEvents:
            isBelowMd && !navigationDrawerOpen ? "none" : "initial",
        },
      }}
      sx={{ width: menuDrawerWidth }}
      onClose={closeNavigationDrawer}
      onOpen={openNavigationDrawer}
      translate="yes"
    >
      <Toolbar
        sx={{
          height: 88,
          px: 4,
          [theme.breakpoints.up("sm")]: {
            px: 4,
          },
        }}
      >
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

      {!isBelowMd && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <ConnectWallet />
        </Box>
      )}

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
          id="nav-send"
          title="Send"
          href="/send"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/send", "/transfer")}
          icon={ArrowRightAltRoundedIcon}
        />

        <NavigationItem
          id="nav-wrap-unwrap"
          title="Wrap / Unwrap"
          href="/wrap?upgrade"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/wrap")}
          icon={ControlPointDuplicateOutlinedIcon}
        />

        <NavigationItem
          id="nav-bridge"
          title="Bridge"
          href="/bridge"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/bridge")}
          icon={LooksRoundedIcon}
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
          icon={AutoStoriesOutlinedIcon}
        />

        <NavigationItem
          id="nav-vesting"
          title="Vesting"
          href="/vesting"
          onClick={closeNavigationDrawer}
          active={isActiveRoute(
            "/vesting",
            "/vesting/create",
            "/vesting/[_network]/[_id]"
          )}
          icon={LockClockRoundedIcon}
        />

        <NavigationItem
          id="nav-settings"
          title="Settings"
          href="/settings"
          onClick={closeNavigationDrawer}
          active={isActiveRoute("/settings")}
          icon={SettingsIcon}
        />

        <NavigationItem
          id="nav-ecosystem"
          title="Ecosystem"
          href="https://www.superfluid.finance/ecosystem"
          onClick={closeNavigationDrawer}
          active={false}
          icon={AppsRoundedIcon}
          isExternal
        />

      </Stack>

      <Stack justifyContent="flex-end" sx={{ flex: 1 }}>
        <Stack
          sx={{ my: 2, px: 2, color: theme.palette.text.secondary }}
          gap={1}
        >
          <ThemeChanger />
          <MoreNavigationItem />
        </Stack>
      </Stack>
    </SwipeableDrawer>
  );
});
