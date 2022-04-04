import Head from "next/head";
import { AppProps } from "next/app";
import { ThemeProvider as ThemeProviderMui } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider, css, EmotionCache, Global } from "@emotion/react";
import createEmotionCache from "../createEmotionCache";
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
  Theme,
  Toolbar,
} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import Image from "next/image";
import ConnectWallet from "../components/ConnectWallet";
import { WalletContextProvider } from "../contexts/WalletContext";
import { FC, ReactNode, useEffect, useState, useMemo } from "react";
import { createSuperfluidMuiTheme } from "../theme";
import { ThemeProvider as NextThemes } from "next-themes";
import { useTheme as useThemeNextThemes } from "next-themes";
import { useTheme as useThemeMui } from "@mui/material";
import ThemeChanger from "../components/ThemeChanger";
import { NetworkContextProvider } from "../contexts/NetworkContext";
import SelectNetwork from "../components/SelectNetwork";
import Link from "next/link";
import { Provider } from "react-redux";
import { reduxStore } from "../redux/store";
import { setFrameworkForSdkRedux } from "@superfluid-finance/sdk-redux";
import infuraProviders from "../infuraProviders";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import TransactionList from "../components/TransactionDrawer/TransactionList";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

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

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useEffect(() => {
    infuraProviders.map((x) =>
      setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
    );
  });

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      {/* https://github.com/pacocoursey/next-themes#without-css-variables */}
      <Global
        styles={css`
          :root {
            --fg: #000;
            --bg: #fff;
          }

          [data-theme="dark"] {
            --fg: #fff;
            --bg: #000;
          }
        `}
      />
      <NextThemes disableTransitionOnChange>
        <Provider store={reduxStore}>
          <NetworkContextProvider>
            <WalletContextProvider>
              <Mui>
                <Layout>
                  {/* TODO: CHAINID KEY? */}
                  <Component {...pageProps} />
                </Layout>
              </Mui>
            </WalletContextProvider>
          </NetworkContextProvider>
        </Provider>
      </NextThemes>
    </CacheProvider>
  );
}

const Mui: FC = ({ children }) => {
  const { theme: themeMode } = useThemeNextThemes();
  const [muiThemeMode, setMuiThemeMode] = useState<"light" | "dark">("light");

  const [mounted, setMounted] = useState(false);

  const muiTheme = useMemo(
    () => createSuperfluidMuiTheme(muiThemeMode),
    [muiThemeMode]
  );

  useEffect(() => {
    setMounted(true), setMuiThemeMode(themeMode);
  }, [themeMode]);

  return (
    <ThemeProviderMui theme={muiTheme}>
      <CssBaseline />
      <Box sx={{ ...(!mounted ? { display: "none" } : {}) }}>{children}</Box>
    </ThemeProviderMui>
  );
};

const Layout: FC = ({ children }) => {
  const muiTheme = useThemeMui();

  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

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
        open={open}
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
            onClick={() => setOpen(!open)}
            sx={{ ...(open && { display: "none" }) }}
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
            loader={({ src }) => src}
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

          <Link href="/wrap" passHref>
            <ListItem button>
              <ListItemText primary="Wrap" />
            </ListItem>
          </Link>
        </List>
      </Drawer>

      <Main open={open}>
        {/* 
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
        > */}
        <Toolbar />
        {children}
        {/* </Box> */}
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
        open={open}
      >
        <DrawerHeader>
          <IconButton
            color="primary"
            aria-label="open drawer"
            edge="end"
            onClick={() => setOpen(!open)}
          >
            <NotificationsOutlinedIcon />
          </IconButton>
          {/* <IconButton onClick={handleDrawerClose}>
              <ChevronRightIcon color="primary" />
            </IconButton> */}
          {/* <Typography variant="h5">Transactions</Typography> */}
        </DrawerHeader>
        <Divider />
        <TransactionList></TransactionList>
      </Drawer>
    </Box>
  );
};
