import Head from "next/head";
import { AppProps } from "next/app";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "../features/theme/createEmotionCache";
import { useEffect } from "react";
import { setFrameworkForSdkRedux } from "@superfluid-finance/sdk-redux";
import readOnlyFrameworks from "../features/network/readOnlyFrameworks";
import Layout from "../features/layout/Layout";
import MuiProvider from "../features/theme/MuiProvider";
import { NetworkContextProvider } from "../features/network/NetworkContext";
import { WalletContextProvider } from "../features/wallet/WalletContext";
import ReduxProvider from "../features/redux/ReduxProvider";
import ReduxPersistGate from "../features/redux/ReduxPersistGate";
import NextThemesProvider from "../features/theme/NextThemesProvider";
import { TransactionRestorationContextProvider } from "../features/transactionRestoration/TransactionRestorationContext";
import { TransactionDrawerContextProvider } from "../features/transactionDrawer/TransactionDrawerContext";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  useEffect(() => {
    readOnlyFrameworks.map((x) =>
      setFrameworkForSdkRedux(x.chainId, x.frameworkGetter)
    );
  });

  return (
    <ReduxProvider>
      <NextThemesProvider>
        <CacheProvider value={emotionCache}>
          <Head>
            <meta
              name="viewport"
              content="initial-scale=1, width=device-width"
            />
          </Head>
          <MuiProvider>
            <NetworkContextProvider>
              {(network) => (
                <WalletContextProvider>
                  <TransactionRestorationContextProvider>
                    <TransactionDrawerContextProvider>
                      <Layout>
                        <ReduxPersistGate>
                          {/* TODO: Is this key={network.chainId} necessary? It triggers rerendering   */}
                          <Component {...pageProps} />
                        </ReduxPersistGate>
                      </Layout>
                    </TransactionDrawerContextProvider>
                  </TransactionRestorationContextProvider>
                </WalletContextProvider>
              )}
            </NetworkContextProvider>
          </MuiProvider>
        </CacheProvider>
      </NextThemesProvider>
    </ReduxProvider>
  );
}
