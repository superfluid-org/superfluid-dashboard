// import "../wdyr"; // Un-comment if you want Why-Did-You-Render support
import '../BigInt.toJson';

import { allNetworks as _importNetworksForInitialization } from "../features/network/networks";
import { CacheProvider, EmotionCache } from "@emotion/react";
import { NextPage } from "next";
import { AppProps } from "next/app";
import Head from "next/head";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import { hotjar } from "react-hotjar";
import "react-toastify/dist/ReactToastify.css";
import MonitorContext from "../components/MonitorContext/MonitorContext";
import { ToastProvider } from "../components/Toast/toast";
import { AnalyticsProvider } from "../features/analytics/AnalyticsProvider";
import { ImpersonationProvider } from "../features/impersonation/ImpersonationContext";
import IntercomProvider from "../features/intercom/IntercomProvider";
import Layout from "../features/layout/Layout";
import { LayoutContextProvider } from "../features/layout/LayoutContext";
import { MinigameProvider } from "../features/minigame/MinigameContext";
import { ActiveNetworksProvider } from "../features/network/ActiveNetworksContext";
import { AvailableNetworksProvider } from "../features/network/AvailableNetworksContext";
import { ExpectedNetworkProvider } from "../features/network/ExpectedNetworkContext";
import MuiProvider from "../features/theme/MuiProvider";
import NextThemesProvider from "../features/theme/NextThemesProvider";
import createEmotionCache from "../features/theme/createEmotionCache";
import { TransactionRestorationContextProvider } from "../features/transactionRestoration/TransactionRestorationContext";
import ConnectButtonProvider from "../features/wallet/ConnectButtonProvider";
import { VisibleAddressProvider } from "../features/wallet/VisibleAddressContext";
import WagmiManager from "../features/wallet/WagmiManager";
import { initializeSuperfluidDashboardGlobalObject } from "../global";
import { IsCypress } from "../utils/SSRUtils";
import config from "../utils/config";
import { useAppDispatch } from "../features/redux/store";
import ReduxProvider from '@/features/redux/ReduxProvider';

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

export interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

type AppPropsWithLayout = MyAppProps & {
  Component: NextPageWithLayout;
};

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export default function MyApp(props: AppPropsWithLayout) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || ((page) => page);

  useEffect(() => {
    const { id, sv } = config.hotjar;
    if (!IsCypress && id && sv) {
      hotjar.initialize({ id: Number(id), sv: Number(sv) });
    } else {
      console.warn("Hotjar not initialized.");
    }
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <NextThemesProvider>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <WagmiManager>
          <ReduxProvider>
            <AvailableNetworksProvider>
              <ImpersonationProvider>
                <ExpectedNetworkProvider>
                  <ActiveNetworksProvider>
                    <MuiProvider>
                      {(_muiTheme) => (
                        <VisibleAddressProvider>
                          <ConnectButtonProvider>
                            <TransactionRestorationContextProvider>
                              <LayoutContextProvider>
                                <AnalyticsProvider>
                                  <ToastProvider />
                                  <IntercomProvider>
                                    <Layout>
                                      <MinigameProvider>
                                        {mounted ? getLayout(
                                          <Component {...pageProps} />
                                        ) : null}
                                      </MinigameProvider>
                                    </Layout>
                                    <MonitorContext />
                                  </IntercomProvider>
                                </AnalyticsProvider>
                              </LayoutContextProvider>
                            </TransactionRestorationContextProvider>
                          </ConnectButtonProvider>
                        </VisibleAddressProvider>
                      )}
                    </MuiProvider>
                  </ActiveNetworksProvider>
                </ExpectedNetworkProvider>
              </ImpersonationProvider>
            </AvailableNetworksProvider>
            <GlobalSuperfluidDashboardObjectInitializer />
          </ReduxProvider>
        </WagmiManager>
      </CacheProvider>
    </NextThemesProvider>
  );
}

function GlobalSuperfluidDashboardObjectInitializer() {
  const appDispatch = useAppDispatch();

  useEffect(() => {
    initializeSuperfluidDashboardGlobalObject({
      appDispatch,
    });
  }, [appDispatch]);

  return null;
}