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
import NextThemesProvider from "../components/NextThemesProvider";
import ReduxProvider from "../redux/ReduxProvider";

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
    <NextThemesProvider>
      <CacheProvider value={emotionCache}>
        <MuiProvider>
          {(_muiTheme) => (
            <ReduxProvider>
              <NetworkContextProvider>
                {(network) => (
                  <WalletContextProvider>
                    <Layout>
                      <Component key={network.chainId} {...pageProps} />
                    </Layout>
                  </WalletContextProvider>
                )}
              </NetworkContextProvider>
            </ReduxProvider>
          )}
        </MuiProvider>
      </CacheProvider>
    </NextThemesProvider>
  );
}
