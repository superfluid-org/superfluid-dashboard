import Head from "next/head";
import { AppProps } from "next/app";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "../createEmotionCache";
import { useEffect } from "react";
import { setFrameworkForSdkRedux } from "@superfluid-finance/sdk-redux";
import readOnlyFrameworks from "../readOnlyFrameworks";
import Layout from "../components/Theme/Layout";
import MuiProvider from "../components/Theme/MuiProvider";
import { NetworkContextProvider } from "../components/Network/NetworkContext";
import { WalletContextProvider } from "../components/Wallet/WalletContext";
import ReduxProvider from "../redux/ReduxProvider";
import ReduxPersistGate from "../redux/ReduxPersistGate";
import NextThemesProvider from "../components/Theme/NextThemesProvider";
import { TransactionDialogContextProvider } from "../components/Transactions/TransactionDialogContext";
import { TransactionRecoveryContextProvider } from "../components/TransactionDrawer/TransactionRecoveryContext";
import { TransactionDrawerContextProvider } from "../components/TransactionDrawer/TransactionDrawerContext";

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
                  <TransactionRecoveryContextProvider>
                    <TransactionDrawerContextProvider>
                      <Layout>
                        <ReduxPersistGate>
                          <TransactionDialogContextProvider>
                            <Component key={network.chainId} {...pageProps} />
                          </TransactionDialogContextProvider>
                        </ReduxPersistGate>
                      </Layout>
                    </TransactionDrawerContextProvider>
                  </TransactionRecoveryContextProvider>
                </WalletContextProvider>
              )}
            </NetworkContextProvider>
          </MuiProvider>
        </CacheProvider>
      </NextThemesProvider>
    </ReduxProvider>
  );
}
