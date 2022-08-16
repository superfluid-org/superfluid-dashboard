import { CacheProvider, EmotionCache } from "@emotion/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { useEffect } from "react";
import { hotjar } from "react-hotjar";
import MonitorContext from "../components/MonitorContext/MonitorContext";
import { AutoConnectProvider } from "../features/autoConnect/AutoConnect";
import { ImpersonationProvider } from "../features/impersonation/ImpersonationContext";
import IntercomProvider from "../features/intercom/IntercomProvider";
import Layout from "../features/layout/Layout";
import { LayoutContextProvider } from "../features/layout/LayoutContext";
import { ActiveNetworksProvider } from "../features/network/ActiveNetworksContext";
import { ExpectedNetworkProvider } from "../features/network/ExpectedNetworkContext";
import ReduxPersistGate from "../features/redux/ReduxPersistGate";
import ReduxProvider from "../features/redux/ReduxProvider";
import createEmotionCache from "../features/theme/createEmotionCache";
import MuiProvider from "../features/theme/MuiProvider";
import NextThemesProvider from "../features/theme/NextThemesProvider";
import { TransactionRestorationContextProvider } from "../features/transactionRestoration/TransactionRestorationContext";
import ConnectButtonProvider from "../features/wallet/ConnectButtonProvider";
import { VisibleAddressProvider } from "../features/wallet/VisibleAddressContext";
import WagmiManager, {
  RainbowKitManager,
} from "../features/wallet/WagmiManager";
import config from "../utils/config";
import { IsCypress } from "../utils/SSRUtils";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useEffect(() => {
    const { id, sv } = config.hotjar;
    if (!IsCypress && id && sv) {
      hotjar.initialize(Number(id), Number(sv));
    } else {
      console.warn("Hotjar not initialized.");
    }
  }, []);

  return (
    <NextThemesProvider>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <WagmiManager>
          <AutoConnectProvider>
            <ReduxProvider>
              <ImpersonationProvider>
                <ExpectedNetworkProvider>
                  {(network) => (
                    <ActiveNetworksProvider>
                      <MuiProvider>
                        {(_muiTheme) => (
                          <RainbowKitManager>
                            <ConnectButtonProvider>
                              <VisibleAddressProvider>
                                <TransactionRestorationContextProvider>
                                  <LayoutContextProvider>
                                    <IntercomProvider>
                                      <Layout>
                                        <ReduxPersistGate>
                                          <MonitorContext />
                                          <Component
                                            key={`${network.slugName}`}
                                            {...pageProps}
                                          />
                                        </ReduxPersistGate>
                                      </Layout>
                                    </IntercomProvider>
                                  </LayoutContextProvider>
                                </TransactionRestorationContextProvider>
                              </VisibleAddressProvider>
                            </ConnectButtonProvider>
                          </RainbowKitManager>
                        )}
                      </MuiProvider>
                    </ActiveNetworksProvider>
                  )}
                </ExpectedNetworkProvider>
              </ImpersonationProvider>
            </ReduxProvider>
          </AutoConnectProvider>
        </WagmiManager>
      </CacheProvider>
    </NextThemesProvider>
  );
}
