import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import HistoryIcon from "@mui/icons-material/History";
import AutoAwesomeMosaicIcon from "@mui/icons-material/AutoAwesomeMosaic";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { memo, FC } from "react";
import Link from "../common/Link";
import ThemeChanger from "../theme/ThemeChanger";
import ConnectWallet from "../wallet/ConnectWallet";
import { SvgIconComponent } from "@mui/icons-material";

export const menuDrawerWidth = 260;

interface NavigationItemProps {
  title: string;
  href: string;
  active: boolean;
  icon: SvgIconComponent;
}

const NavigationItem: FC<NavigationItemProps> = ({
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
      <ListItemText primary={title} />
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
      variant="permanent"
      anchor="left"
      PaperProps={{ sx: { width: menuDrawerWidth, borderRadius: 0 } }}
      sx={{ width: menuDrawerWidth }}
    >
      <Toolbar sx={{ height: 88 }}>
        <Link href="/">
          <Image
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
          title="Dashboard"
          href="/"
          active={isActiveRoute("/", "/[_network]/token")}
          icon={AutoAwesomeMosaicIcon}
        />

        <NavigationItem
          title="Wrap / Unwrap"
          href="/wrap?upgrade"
          active={isActiveRoute("/wrap")}
          icon={SwapVertIcon}
        />

        <NavigationItem
          title="Send Stream"
          href="/send"
          active={isActiveRoute("/send")}
          icon={ArrowRightAltIcon}
        />

        <NavigationItem
          title="Activity History"
          href="/history"
          active={isActiveRoute("/history")}
          icon={HistoryIcon}
        />

        {/* <NavigationItem
          title="Ecosystem"
          href="/ecosystem"
          active={isActiveRoute("/ecosystem")}
          icon={AppsRoundedIcon}
        /> */}
      </Stack>

      <Stack justifyContent="flex-end" sx={{ flex: 1 }}>
        <Divider />
        <Stack direction="row" justifyContent="center" sx={{ m: 1 }}>
          <ThemeChanger />
        </Stack>
      </Stack>
    </Drawer>
  );
});
