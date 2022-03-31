import Head from "next/head";
import { AppProps } from "next/app";
import { ThemeProvider as ThemeProviderMui } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "../createEmotionCache";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  Stack,
  styled,
  Theme,
  Toolbar,
  Typography,
} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import Image from "next/image";
import ConnectWallet from "../components/ConnectWallet";
import { ethers } from "ethers";
import WalletContext from "../contexts/WalletContext";
import { FC, ReactNode, useEffect, useState } from "react";
import { createSuperfluidMuiTheme } from "../theme";
import { ThemeProvider as ThemeProviderNextThemes } from "next-themes";
import { useTheme as useThemeNextThemes } from "next-themes";
import ThemeChanger from "../components/ThemeChanger";
import NetworkContext from "../contexts/NetworkContext";
import { Network, networks, networksByChainId } from "../networks";
import SelectNetwork from "../components/SelectNetwork";
import Link from "next/link";
import { Provider } from "react-redux";
import { reduxStore, transactionSlice, useAppSelector } from "../redux/store";
import { Framework } from "@superfluid-finance/sdk-core";
import {
  setFrameworkForSdkRedux,
  setSignerForSdkRedux,
  TrackedTransaction,
  transactionSelectors,
} from "@superfluid-finance/sdk-redux";
import infuraProviders from "../infuraProviders";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TransactionList from "../components/TransactionList";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const menuDrawerWidth = 240;
const transactionDrawerWidth = 480;

const DrawerBar = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
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

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
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
  })
);

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const [network, setNetwork] = useState<Network>(networksByChainId.get(137)!);

  const [walletProvider, setWalletProvider] = useState<
    ethers.providers.Web3Provider | undefined
  >();
  const [walletAddress, setWalletAddress] = useState<string | undefined>();
  const [walletChainId, setWalletChainId] = useState<number | undefined>();

  useEffect(() => {
    infuraProviders.map((x) =>
      setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
    );
  });

  const [open, setOpen] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProviderNextThemes>
        <Provider store={reduxStore}>
          <Mui>
            {(muiTheme) => (
              <NetworkContext.Provider
                value={{
                  network: network,
                  setNetwork: (network) => setNetwork(network),
                }}
              >
                <WalletContext.Provider
                  value={{
                    walletChainId: walletChainId,
                    walletAddress: walletAddress,
                    walletProvider: walletProvider,
                    setProvider: async (web3Provider) => {
                      const ethersProvider = new ethers.providers.Web3Provider(
                        web3Provider
                      );

                      const chainId = (await ethersProvider.getNetwork())
                        .chainId;
                      const address = await ethersProvider
                        .getSigner()
                        .getAddress();
                      setWalletChainId(chainId);
                      setWalletAddress(address);
                      setWalletProvider(ethersProvider);
                      setSignerForSdkRedux(Number(chainId), () =>
                        Promise.resolve(ethersProvider.getSigner())
                      );

                      infuraProviders.map((x) =>
                        setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
                      );

                      web3Provider.on(
                        "accountsChanged",
                        (accounts: string[]) => {
                          setWalletAddress(accounts[0]);

                          setSignerForSdkRedux(chainId, () =>
                            Promise.resolve(ethersProvider.getSigner())
                          );
                        }
                      );

                      web3Provider.on("chainChanged", (chainId: number) => {
                        infuraProviders.map((x) =>
                          setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
                        );

                        setWalletChainId(Number(chainId)); // Chain ID might be coming in hex.
                        setSignerForSdkRedux(Number(chainId), () =>
                          Promise.resolve(ethersProvider.getSigner())
                        );
                      });
                    },
                  }}
                >
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
                      <Component key={network.chainId} {...pageProps} />
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
                </WalletContext.Provider>
              </NetworkContext.Provider>
            )}
          </Mui>
        </Provider>
      </ThemeProviderNextThemes>
    </CacheProvider>
  );
}

const Mui: FC<{ children: (muiTheme: Theme) => ReactNode }> = ({
  children,
}) => {
  const { theme } = useThemeNextThemes();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const muiTheme = createSuperfluidMuiTheme(theme);

  return (
    <ThemeProviderMui theme={muiTheme}>
      <CssBaseline />
      {children(muiTheme)}
    </ThemeProviderMui>
  );
};
