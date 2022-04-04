import Head from "next/head";
import { AppProps } from "next/app";
import { CacheProvider, css, EmotionCache, Global } from "@emotion/react";
import createEmotionCache from "../createEmotionCache";
import { useEffect } from "react";
import { ThemeProvider as NextThemes } from "next-themes";
import { setFrameworkForSdkRedux } from "@superfluid-finance/sdk-redux";
import readOnlyFrameworks from "../readOnlyFrameworks";
import Layout from "../components/Layout";
import Mui from "../components/Mui";
import { Provider } from "react-redux";
import { NetworkContextProvider } from "../contexts/NetworkContext";
import { WalletContextProvider } from "../contexts/WalletContext";
import { reduxStore } from "../redux/store";

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
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      {/* https://github.com/pacocoursey/next-themes#without-css-variables */}
      <Global
        styles={css`
          :root {
            --fg: #000;
            --bg: #fff;
          }

          [data-theme="dark"] {
            --fg: #fff;
            --bg: #000;
          }
        `}
      />
      <NextThemes disableTransitionOnChange>
        <Mui>
          {(_muiTheme) => (
            <Provider store={reduxStore}>
              <NetworkContextProvider>
                {(network) => (
                  <WalletContextProvider>
                    <Layout>
                      <Component key={network.chainId} {...pageProps} />
                    </Layout>
                  </WalletContextProvider>
                )}
              </NetworkContextProvider>
            </Provider>
          )}
        </Mui>
      </NextThemes>
    </CacheProvider>
  );
}
