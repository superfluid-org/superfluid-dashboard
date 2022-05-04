import {
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
} from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import AutoAwesomeMosaicIcon from "@mui/icons-material/AutoAwesomeMosaic";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ThemeChanger from "../theme/ThemeChanger";
import { useTheme } from "@mui/material";
import Link from "../common/Link";
import { memo } from "react";

export const menuDrawerWidth = 260;

export default memo(function NavigationDrawer() {
  const muiTheme = useTheme();

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      PaperProps={{ sx: { width: menuDrawerWidth } }}
      sx={{ width: menuDrawerWidth }}
    >
      <Toolbar sx={{ height: "88px" }}>
        <Link href="/">
          <Image
            unoptimized
            src={
              muiTheme.palette.mode === "dark"
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

      <List component={List} sx={{ flex: 1 }}>
        <NextLink href={"/"} passHref>
          <ListItem button>
            <ListItemIcon>
              <AutoAwesomeMosaicIcon></AutoAwesomeMosaicIcon>
            </ListItemIcon>
            <ListItemText primary="Overview" />
          </ListItem>
        </NextLink>

        <NextLink href={"/wrap?upgrade"} passHref>
          <ListItem button>
            <ListItemIcon>
              <SwapVertIcon></SwapVertIcon>
            </ListItemIcon>
            <ListItemText primary="Wrap / Unwrap" />
          </ListItem>
        </NextLink>
      </List>

      <Stack justifyContent="flex-end" sx={{ flex: 1 }}>
        <Divider />
        <Stack direction="row" justifyContent="center" sx={{ m: 1 }}>
          <ThemeChanger />
        </Stack>
      </Stack>
    </Drawer>
  );
});
