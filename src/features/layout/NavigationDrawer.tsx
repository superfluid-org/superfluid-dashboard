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
  Toolbar,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { FC, memo } from "react";
import Link from "../common/Link";
import ThemeChanger from "../theme/ThemeChanger";
import ConnectWallet from "../wallet/ConnectWallet";
import MoreNavigationItem from "./MoreNavigationItem";

export const menuDrawerWidth = 260;

interface NavigationItemProps {
  id: string;
  title: string;
  href: string;
  active: boolean;
  icon: typeof SvgIcon;
}

const NavigationItem: FC<NavigationItemProps> = ({
  id,
  title,
  href,
  active,
  icon: Icon,
}) => (
  <NextLink href={href} passHref>
    <ListItemButton sx={{ borderRadius: "10px" }} selected={active}>
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

  const isActiveRoute = (...routes: Array<string>) =>
    routes.includes(router.route);

  return (
    <Drawer
      data-cy={"navigation-drawer"}
      variant="permanent"
      anchor="left"
      PaperProps={{ sx: { width: menuDrawerWidth, borderRadius: 0 } }}
      sx={{ width: menuDrawerWidth }}
    >
      <Toolbar sx={{ height: 88 }}>
        <Link href="/">
          <Image
            data-cy={"superfluid-logo"}
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
          active={isActiveRoute("/", "/[_network]/token")}
          icon={AutoAwesomeMosaicRoundedIcon}
        />

        <NavigationItem
          id="nav-wrap-unwrap"
          title="Wrap / Unwrap"
          href="/wrap?upgrade"
          active={isActiveRoute("/wrap")}
          icon={SwapVertRoundedIcon}
        />

        <NavigationItem
          id="nav-send"
          title="Send Stream"
          href="/send"
          active={isActiveRoute("/send")}
          icon={ArrowRightAltRoundedIcon}
        />

        <NavigationItem
          id="nav-history"
          title="Activity History"
          href="/history"
          active={isActiveRoute("/history")}
          icon={HistoryRoundedIcon}
        />

        <NavigationItem
          id="nav-address-book"
          title="Address Book"
          href="/address-book"
          active={isActiveRoute("/address-book")}
          icon={ImportContactsRoundedIcon}
        />

        <NavigationItem
          id="nav-ecosystem"
          title="Ecosystem"
          href="/ecosystem"
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
    </Drawer>
  );
});
