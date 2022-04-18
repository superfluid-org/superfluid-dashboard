import {
  AppBar,
  Box,
  Card,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  Stack,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import Image from "next/image";
import ConnectWallet from "../Wallet/ConnectWallet";
import { FC } from "react";
import { useTheme as useMuiTheme } from "@mui/material";
import ThemeChanger from "./ThemeChanger";
import SelectNetwork from "../Network/SelectNetwork";
import Link from "next/link";
import ReduxPersistGate from "../../redux/ReduxPersistGate";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import AutoAwesomeMosaicIcon from "@mui/icons-material/AutoAwesomeMosaic";
import { TransactionBell } from "../Transactions/TransactionBell";
import TransactionList from "../TransactionDrawer/TransactionList";
import { useTransactionDrawerContext } from "../TransactionDrawer/TransactionDrawerContext";

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

  const { transactionDrawerOpen } = useTransactionDrawerContext();

  return (
    <Box sx={{ display: "flex" }}>
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
        >
          <Card sx={{ p: 2, mt: 3 }} variant="outlined">
            <Stack direction="row" spacing={2}>
              <SelectNetwork></SelectNetwork>
              <ConnectWallet></ConnectWallet>
              <TransactionBell />
            </Stack>
          </Card>
        </Stack>
      </DrawerBar>
      {/* TODO(KK): Not working properly */}
      <Stack
        component={Drawer}
        sx={{
          height: "100vh",
          width: menuDrawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: menuDrawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="permanent"
        anchor="left"
        direction="column"
        justifyContent="space-between"
        alignItems="center"
        spacing={0}
      >
        <Stack>
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
        </Stack>

        <Stack
          component={List}
          justifyContent="center"
          alignItems="center"
          sx={{ flex: 1 }}
        >
          <Link href="/" passHref>
            <ListItem button>
              <ListItemIcon>
                <AutoAwesomeMosaicIcon></AutoAwesomeMosaicIcon>
              </ListItemIcon>
              <ListItemText primary="Overview" />
            </ListItem>
          </Link>
          <Link href="/upgrade" passHref>
            <ListItem button>
              <ListItemIcon>
                <AutoAwesomeIcon></AutoAwesomeIcon>
              </ListItemIcon>
              <ListItemText primary="Upgrade" />
            </ListItem>
          </Link>
        </Stack>

        <Stack justifyContent="flex-end" sx={{ flex: 1 }}>
          <Divider />
          <Stack direction="row" justifyContent="center" sx={{ m: 1 }}>
            <ThemeChanger></ThemeChanger>
          </Stack>
        </Stack>
      </Stack>

      <Main open={transactionDrawerOpen}>
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
          <Typography variant="body1" sx={{ m: 1 }}>
            Notifications
          </Typography>
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
