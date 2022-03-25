import Head from "next/head";
import { AppProps } from "next/app";
import { ThemeProvider as ThemeProviderMui } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "../createEmotionCache";
import {
  AppBar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  List,
  ListItem,
  Stack,
  Theme,
  Toolbar,
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
import { reduxStore } from "../redux/store";
import { Framework } from "@superfluid-finance/sdk-core";
import {
  setFrameworkForSdkRedux,
  setSignerForSdkRedux,
} from "@superfluid-finance/sdk-redux";
import infuraProviders from "../infuraProviders";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const drawerWidth = 240;

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
                    <AppBar
                      position="fixed"
                      sx={{
                        color: "text.primary",
                        width: `calc(100% - ${drawerWidth}px)`,
                        ml: `${drawerWidth}px`,
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
                      </Stack>
                    </AppBar>
                    <Drawer
                      sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        "& .MuiDrawer-paper": {
                          width: drawerWidth,
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
                        <ListItem button>
                          <ListItemText primary="Dashboard" />
                        </ListItem>
                        <Link href="/wrap" passHref>
                          <ListItem button>
                            <ListItemText primary="Wrap" />
                          </ListItem>
                        </Link>
                      </List>
                    </Drawer>
                    <Box
                      component="main"
                      sx={{ flexGrow: 1, bgcolor: "background.default", p: 3 }}
                    >
                      <Toolbar />
                      <Component key={network.chainId} {...pageProps} />
                    </Box>
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
