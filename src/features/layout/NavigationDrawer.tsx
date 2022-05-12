import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
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
  Stack,
  Toolbar,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { memo } from "react";
import Link from "../common/Link";
import ThemeChanger from "../theme/ThemeChanger";
import ConnectWallet from "../wallet/ConnectWallet";

export const menuDrawerWidth = 260;

export default memo(function NavigationDrawer() {
  const theme = useTheme();

  const router = useRouter();

  const isActiveRoute = (route: string) => router.route === route;

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      PaperProps={{ sx: { width: menuDrawerWidth } }}
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
        <NextLink href={"/"} passHref>
          <ListItemButton
            sx={{ borderRadius: "10px" }}
            selected={isActiveRoute("/")}
          >
            <ListItemIcon>
              <AutoAwesomeMosaicIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </NextLink>

        <NextLink href={"/wrap?upgrade"} passHref>
          <ListItemButton
            sx={{ borderRadius: "10px" }}
            selected={isActiveRoute("/wrap")}
          >
            <ListItemIcon>
              <SwapVertIcon />
            </ListItemIcon>
            <ListItemText primary="Wrap / Unwrap" />
          </ListItemButton>
        </NextLink>
        <NextLink href={"/send"} passHref>
          <ListItemButton
            sx={{ borderRadius: "10px" }}
            selected={isActiveRoute("/send")}
          >
            <ListItemIcon>
              <ArrowRightAltIcon />
            </ListItemIcon>
            <ListItemText primary="Send" />
          </ListItemButton>
        </NextLink>
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
