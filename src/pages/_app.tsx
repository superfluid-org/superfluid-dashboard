import Head from "next/head";
import { AppProps } from "next/app";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "../createEmotionCache";
import { useEffect } from "react";
import { setFrameworkForSdkRedux } from "@superfluid-finance/sdk-redux";
import readOnlyFrameworks from "../readOnlyFrameworks";
import Layout from "../components/Layout";
import MuiProvider from "../components/MuiProvider";
import { NetworkContextProvider } from "../contexts/NetworkContext";
import { WalletContextProvider } from "../contexts/WalletContext";
import ReduxProvider from "../redux/ReduxProvider";
import ReduxPersistGate from "../components/ReduxPersistGate";
import NextThemesProvider from "../components/NextThemesProvider";

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
                  <Layout>
                    <ReduxPersistGate>
                      <Component key={network.chainId} {...pageProps} />
                    </ReduxPersistGate>
                  </Layout>
                </WalletContextProvider>
              )}
            </NetworkContextProvider>
          </MuiProvider>
        </CacheProvider>
      </NextThemesProvider>
    </ReduxProvider>
  );
}
