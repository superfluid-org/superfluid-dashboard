import { CacheProvider, EmotionCache } from "@emotion/react";
import { NextPage } from "next";
import { AppProps } from "next/app";
import Head from "next/head";
import { ReactElement, ReactNode, useEffect } from "react";
import { hotjar } from "react-hotjar";
import "react-toastify/dist/ReactToastify.css";
import MonitorContext from "../components/MonitorContext/MonitorContext";
import { ToastProvider } from "../components/Toast/toast";
import { AnalyticsProvider } from "../features/analytics/AnalyticsProvider";
import { AutoConnectProvider } from "../features/autoConnect/AutoConnect";
import { ImpersonationProvider } from "../features/impersonation/ImpersonationContext";
import IntercomProvider from "../features/intercom/IntercomProvider";
import Layout from "../features/layout/Layout";
import { LayoutContextProvider } from "../features/layout/LayoutContext";
import { MinigameProvider } from "../features/minigame/MinigameContext";
import { ActiveNetworksProvider } from "../features/network/ActiveNetworksContext";
import { AvailableNetworksProvider } from "../features/network/AvailableNetworksContext";
import { ExpectedNetworkProvider } from "../features/network/ExpectedNetworkContext";
import ReduxProvider from "../features/redux/ReduxProvider";
import MuiProvider from "../features/theme/MuiProvider";
import NextThemesProvider from "../features/theme/NextThemesProvider";
import createEmotionCache from "../features/theme/createEmotionCache";
import { TransactionRestorationContextProvider } from "../features/transactionRestoration/TransactionRestorationContext";
import ConnectButtonProvider from "../features/wallet/ConnectButtonProvider";
import { VisibleAddressProvider } from "../features/wallet/VisibleAddressContext";
import WagmiManager, {
  RainbowKitManager,
} from "../features/wallet/WagmiManager";
import { initializeSuperfluidDashboardGlobalObject } from "../global";
import { IsCypress } from "../utils/SSRUtils";
import config from "../utils/config";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

initializeSuperfluidDashboardGlobalObject();

interface MyAppProps extends AppProps {
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
      hotjar.initialize(Number(id), Number(sv));
    } else {
      console.warn("Hotjar not initialized.");
    }
  }, []);

  useEffect(
    () => console.log(`%c${SUPERFLUID_RUNNER_ASCII}`, "font-size: 8px"),
    []
  );

  return (
    <NextThemesProvider>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
        </Head>
        <WagmiManager>
          <AutoConnectProvider>
            <ReduxProvider>
              <AvailableNetworksProvider>
                <ImpersonationProvider>
                  <ExpectedNetworkProvider>
                    <ActiveNetworksProvider>
                      <MuiProvider>
                        {(_muiTheme) => (
                          <RainbowKitManager>
                            <ConnectButtonProvider>
                              <VisibleAddressProvider>
                                <TransactionRestorationContextProvider>
                                  <LayoutContextProvider>
                                    <AnalyticsProvider>
                                      <ToastProvider />
                                      <IntercomProvider>
                                        <MonitorContext />
                                        <Layout>
                                          <MinigameProvider>
                                            {getLayout(
                                              <Component {...pageProps} />
                                            )}
                                          </MinigameProvider>
                                        </Layout>
                                      </IntercomProvider>
                                    </AnalyticsProvider>
                                  </LayoutContextProvider>
                                </TransactionRestorationContextProvider>
                              </VisibleAddressProvider>
                            </ConnectButtonProvider>
                          </RainbowKitManager>
                        )}
                      </MuiProvider>
                    </ActiveNetworksProvider>
                  </ExpectedNetworkProvider>
                </ImpersonationProvider>
              </AvailableNetworksProvider>
            </ReduxProvider>
          </AutoConnectProvider>
        </WagmiManager>
      </CacheProvider>
    </NextThemesProvider>
  );
}

const SUPERFLUID_RUNNER_ASCII = `cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc3/3cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccllooooooooooooollcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccllccldOKKKKKKKKKKKKK0xolllcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccclokO000OOOOOOOOOOOOOOOOO000Oxolccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccldxdlccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccclxKWMMWKxlcllllllllllld0NWWN0dlccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccoO0koccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccllodkKXNNX0dlcllllllllllldOKNNX0kddollccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccclooolccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccclloxk0K0kddddooolllllllllllllodddxk0KKKkdlcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccok000Okkxolccloxkkkkkkdolllllllllllodxkk00Odlcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccccccccccccccccccccccldkxolcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccd0NWNK0OxollllodxxxkO0OkdollllllllllllloONXxlcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccldxxxdllxOOdlccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccco0NMMMMWKxlcllllllldk000kdlcllllllllllldONXxlcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccccccccccccccldOXXKOdlllllcccccclooollccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccloxKWMMMMWXkdllllllllok000OxoloolllllllllokKKkolccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccccccccccccccclodddolcccclllccclxOK0kdlcccccccccccccccccccccclllllccccccccccccccccccccccccccccccccccccccclx0XNWWWWMMWNKkxdllllodk0K000OOOkdlllllllllodk0Kkocccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccoxkdlccloxkxdolccccccccccccccccccccldk000kocccccccccccccccccccccccccccccccccccccclkXNKOO0KNWMMWNXK00000KXNNNNNNNNKkollllllllllxKN0dcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccoxkdlccccccccccccccccccccccccccccccldkKNNKxlccccccccccccccccccccccccccccccccccccclkXXOoodk0XNNNWWMMMMMMMMMMMMMMMMWKOxollllllllxKN0dcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccccccccccccccccccccccccccllccccccccccccccccccccccccccccccccccld0NKxlccccccccccccccccccccccccccccccccccccclkXXOoloxO000KNWWMMMMMMMMMMMMMMMMMNKxllllllllxKN0dcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccllllccccccccccccccccccccccccccccccccccllllccccccccccccccccoOK0dlccccccccccccccccccccccccccccccccccccclkXXOolodkO00KNWWMMMMMMMMMMMMMMMMMWXkolllllclxKN0dcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccclxOOxlcccccccccclcccccccccccccccccccccldO0xlcccccccccccccccloddlcccccccccccccccccccccccccccccccccccccclkXXOolloodkKNWMMMWWWWWMMMMMMMMMMWWNXKkdlllllxKX0dcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccccldkkdlcccccccldkOOkdlcccccoxkxoccccccccoxkdlcccccccccccccccccccccccccldkkdlcccccccccccccccccccccccccccldkO0OkxdooxXWMMWXkdodkXWMMMMMMMN0kOXN0xoloxO0Okdlcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccoONWWNOocccccokOkocccccccccccccccccccccccccccccccccccccclxOOdlccccccccccccccccccccccccccccccd0NNX0Ok0NWMMWO:...:ONMMMMMMMKo;l0N0xoloOXXxlcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccloolcccccccccccccokKNNKkocccccclllccccccccccccccccccccccccccccccccccccccccllllcccccccccccccccccccccccccccccccd0WMMWWWWMMMMWO:. .:kNMMMMMMMKo,c0N0xlloONXxlcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccclx0OdlcccccccccccclloddoollccccccccccccccccccccccccccccccccclllcccccccccccccccccccccccccccccccccccccccccccccccoONWWWMMMMMMMW0c..'cOWMMMMMMWKo:l0NKxoodOXKxlcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccloxxolccccccccccccccccclxOkdlccccccccccccccccccccccccccccccokOkoccccccccccccccccccccccccccccccccccccccccccccccldxO0XNWMMMMMMN0kkk0NWWNXXXXXK0OKNWNXKK0Okdoccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccccccccccccccccccccccldkkocccccccccccccccccccccoxkdlcccccoxOxocccccccccccccccccccccccccccccccccldkOOkkkxoccclodkOKNWMMMMMMMMMMMMMMWNXXXXXNWMMMWNK00Oxlccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccccloddoccccccccccccccclloddddoccccccccccccccccdO0kocccccccllcccccccccccloddlccccccccccccccccccoOXWWNNXKkdoodkOKKXNNWWWWMMMMMMMMMMMMMMMMMMMMWNKkdollccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccclx00xlcccccccccccccccox0KK0xlccccccccccllolllllllcccccccccccccccccccclx0OdlcclllllccccccccccoONWNKKK00OOOO0000KKKKKKNWWMMMMMMMMMMMMMMMMMWXkolccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccccloddolcccccccccccccccloddddlccccccccccldO0kocccccccccccccccccccccccccloddlcccok0koccccccccccoONNX0000000K0000000000KXNNWWWWWWMMMMMWWWWWWN0dccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccoxxdlcccccccccccccccccccccccccccccccccd0N0dccccccccccokKXK000000KXNNNXXKK0000kxddooodkXWWNK0Okkkkkxoccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccloooolcccccccccccldxdoccccccccccloxxxdolcccccccccccccccccccccccccccccccccccccccccokOkocccccccccclxO00000000KXNWMWWNNXXKOxddoooloxKNXOxolcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccclddddolcccloolcccok0OdlccccccccclkKNX0xocccccccccccccccccccccccccccccccccccccccccclllccccloddddddkO000000KKKKXNWWWWWNXKKKXXNNNNNNNKOolcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccclllllccclx00xlcclloolcccccccccclkKNX0xoccccccccccccccccccccccccccccccccccccccccccccccccld0XNNNNXKK00000KNWWWNXKKKKKKK00KKKKKKKK0kdlcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccloddolccccccccccccccccccodxddolcccccccccccccccccccccccccccccccccccccccccccccccclxKWWWMMWNK0000KXNMMMWXK0000000000000000kdcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccldkxolccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccclokOO0KNWWNXXNNNNWMMMWXK00000KXXNXXXXNNX0xlccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccclxOOdlccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccldOKNWMMMMMMMMMMWXK0000KXNWMMMMMMMWXxlccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccllllcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccldOXNNNNNNNNNNXKOOOOOO0XNWWMMMMMMXOdlcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccclddddddddddddoooooooodxKXNMMMMMWNKkoccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccoOKNWMMMMMMN0dccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccclxkO00000KNWX0xoccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccllllllldOKXK0dlcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccclloooolccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
e2809c496e20616e6f74686572206d6f6d656e7420646f776e2077656e7420416c6963652061667465722069742c206e65766572206f6e636520636f6e7369646572696e6720686f7720696e2074686520776f726c64207368652077617320746f20676574206f757420616761696e2ee2809d`;
