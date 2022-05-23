import Head from "next/head";
import { AppProps } from "next/app";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "../features/theme/createEmotionCache";
import { useEffect } from "react";
import Layout from "../features/layout/Layout";
import MuiProvider from "../features/theme/MuiProvider";
import { AppNetworkProvider } from "../features/network/AppNetworkContext";
import { AppWalletProvider } from "../features/wallet/AppWalletContext";
import ReduxProvider from "../features/redux/ReduxProvider";
import ReduxPersistGate from "../features/redux/ReduxPersistGate";
import NextThemesProvider from "../features/theme/NextThemesProvider";
import { TransactionRestorationContextProvider } from "../features/transactionRestoration/TransactionRestorationContext";
import { TransactionDrawerContextProvider } from "../features/transactionDrawer/TransactionDrawerContext";
import { hotjar } from "react-hotjar";
import WagmiManager, {
  RainbowKitManager,
} from "../features/wallet/WagmiManager";

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
    <NextThemesProvider>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <WagmiManager>
          <AppNetworkProvider>
            {(network) => (
              <AppWalletProvider>
                <ReduxProvider>
                  <MuiProvider>
                    {(_muiTheme) => (
                      <RainbowKitManager>
                        <TransactionRestorationContextProvider>
                          <TransactionDrawerContextProvider>
                            <Layout>
                              <ReduxPersistGate>
                                <Component
                                  key={`${network.slugName}`}
                                  {...pageProps}
                                />
                              </ReduxPersistGate>
                            </Layout>
                          </TransactionDrawerContextProvider>
                        </TransactionRestorationContextProvider>
                      </RainbowKitManager>
                    )}
                  </MuiProvider>
                </ReduxProvider>
              </AppWalletProvider>
            )}
          </AppNetworkProvider>
        </WagmiManager>
      </CacheProvider>
    </NextThemesProvider>
  );
}
