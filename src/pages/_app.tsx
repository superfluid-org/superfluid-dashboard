import Head from "next/head";
import { AppProps } from "next/app";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "../features/theme/createEmotionCache";
import { useEffect } from "react";
import Layout from "../features/layout/Layout";
import MuiProvider from "../features/theme/MuiProvider";
import { ExpectedNetworkProvider } from "../features/network/ExpectedNetworkContext";
import ReduxProvider from "../features/redux/ReduxProvider";
import ReduxPersistGate from "../features/redux/ReduxPersistGate";
import NextThemesProvider from "../features/theme/NextThemesProvider";
import { TransactionRestorationContextProvider } from "../features/transactionRestoration/TransactionRestorationContext";
import { TransactionDrawerContextProvider } from "../features/transactionDrawer/TransactionDrawerContext";
import { hotjar } from "react-hotjar";
import WagmiManager, {
  RainbowKitManager,
} from "../features/wallet/WagmiManager";
import { ImpersonationProvider } from "../features/impersonation/ImpersonationContext";
import { VisibleAddressProvider } from "../features/wallet/VisibleAddressContext";
import { ActiveNetworksProvider } from "../features/network/ActiveNetworksContext";
import ConnectButtonProvider from "../features/wallet/ConnectButtonProvider";
import { IntercomProvider } from "react-use-intercom";
import { INTERCOM_APP_ID } from "../features/intercom/IntercomButton";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_HJID && process.env.NEXT_PUBLIC_HJSV) {
      hotjar.initialize(
        Number(process.env.NEXT_PUBLIC_HJID),
        Number(process.env.NEXT_PUBLIC_HJSV)
      );
    } else {
      console.warn("Hotjar not initialized.");
    }
  }, []);

  return (
    <WagmiManager>
      <NextThemesProvider>
        <CacheProvider value={emotionCache}>
          <Head>
            <meta
              name="viewport"
              content="initial-scale=1, width=device-width"
            />
          </Head>
          <ReduxProvider>
            <ImpersonationProvider>
              <ActiveNetworksProvider>
                <ExpectedNetworkProvider>
                  {(network) => (
                    <MuiProvider>
                      {(_muiTheme) => (
                        <RainbowKitManager>
                          <ConnectButtonProvider>
                            <VisibleAddressProvider>
                              <TransactionRestorationContextProvider>
                                <TransactionDrawerContextProvider>
                                  <IntercomProvider
                                    appId={INTERCOM_APP_ID}
                                    initializeDelay={500}
                                  >
                                    <Layout>
                                      <ReduxPersistGate>
                                        <Component
                                          key={`${network.slugName}`}
                                          {...pageProps}
                                        />
                                      </ReduxPersistGate>
                                    </Layout>
                                  </IntercomProvider>
                                </TransactionDrawerContextProvider>
                              </TransactionRestorationContextProvider>
                            </VisibleAddressProvider>
                          </ConnectButtonProvider>
                        </RainbowKitManager>
                      )}
                    </MuiProvider>
                  )}
                </ExpectedNetworkProvider>
              </ActiveNetworksProvider>
            </ImpersonationProvider>
          </ReduxProvider>
        </CacheProvider>
      </NextThemesProvider>
    </WagmiManager>
  );
}
