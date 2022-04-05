import {
  AppBar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  Stack,
  styled,
  Toolbar,
} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import Image from "next/image";
import ConnectWallet from "../components/ConnectWallet";
import { FC, useState } from "react";
import { useTheme as useMuiTheme } from "@mui/material";
import ThemeChanger from "../components/ThemeChanger";
import SelectNetwork from "../components/SelectNetwork";
import Link from "next/link";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import TransactionList from "../components/TransactionDrawer/TransactionList";
import ReduxPersistGate from "./ReduxPersistGate";
import { useTransactionContext } from "./TransactionDrawer/TransactionContext";

const menuDrawerWidth = 240;
const transactionDrawerWidth = 480;

const DrawerBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<{ open: boolean }>(({ theme, open }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${transactionDrawerWidth}px)`,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: transactionDrawerWidth,
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-start",
}));

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: -transactionDrawerWidth,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: 0,
  }),
}));

const Layout: FC = ({ children }) => {
  const muiTheme = useMuiTheme();

  const { transactionDrawerOpen, setTransactionDrawerOpen } = useTransactionContext();

  return (
    <Box sx={{ display: "flex" }}>
      {/* <DrawerBar position="fixed" open={open}>
            <Toolbar>
              <Typography
                variant="h6"
                noWrap
                sx={{ flexGrow: 1 }}
                component="div"
              >
                Persistent drawer
              </Typography>
              Foo
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerOpen}
                sx={{ ...(open && { display: "none" }) }}
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </DrawerBar> */}
      <DrawerBar
        open={transactionDrawerOpen}
        position="fixed"
        sx={{
          color: "text.primary",
          width: `calc(100% - ${menuDrawerWidth}px)`,
          ml: `${menuDrawerWidth}px`,
          background: "transparent",
          boxShadow: "none",
        }}
      >
        <Stack
          component={Toolbar}
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={2}
        >
          <SelectNetwork></SelectNetwork>
          <ConnectWallet></ConnectWallet>
          <ThemeChanger></ThemeChanger>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="end"
            onClick={() => setTransactionDrawerOpen(!transactionDrawerOpen)}
            sx={{ ...(transactionDrawerOpen && { display: "none" }) }}
          >
            <NotificationsOutlinedIcon />
          </IconButton>
        </Stack>
      </DrawerBar>
      <Drawer
        sx={{
          width: menuDrawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: menuDrawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
      >
        <Toolbar sx={{ height: "100px" }}>
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
        </Toolbar>
        <Divider />
        <List>
          <Link href="/" passHref>
            <ListItem button>
              <ListItemText primary="Dashboard" />
            </ListItem>
          </Link>

          <Link href="/upgrade" passHref>
            <ListItem button>
              <ListItemText primary="Wrap" />
            </ListItem>
          </Link>
        </List>
      </Drawer>

      <Main open={transactionDrawerOpen}>
        {/* 
          <Box
            component="main"
            sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
          > */}
        <Toolbar />

        {children}
      </Main>
      <Drawer
        sx={{
          width: transactionDrawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: transactionDrawerWidth,
          },
        }}
        variant="persistent"
        anchor="right"
        open={transactionDrawerOpen}
      >
        <DrawerHeader>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="end"
            onClick={() => setTransactionDrawerOpen(!transactionDrawerOpen)}
          >
            <NotificationsOutlinedIcon />
          </IconButton>
          {/* <IconButton onClick={handleDrawerClose}>
                <ChevronRightIcon color="primary" />
              </IconButton> */}
          {/* <Typography variant="h5">Transactions</Typography> */}
        </DrawerHeader>
        <Divider />
        <ReduxPersistGate>
          <TransactionList></TransactionList>
        </ReduxPersistGate>
      </Drawer>
    </Box>
  );
};

export default Layout;
