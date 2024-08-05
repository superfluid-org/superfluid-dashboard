import {
  Chain,
  connectorsForWallets,
  WalletList,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  braveWallet,
  walletConnectWallet,
  coinbaseWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";
import bitkeep from "./bitkeep/bitkeep";
import gnosisSafe from "./gnosisSafeWalletConnector/gnosisSafe";
import mockConnector from "./mockConnector/mockConnector";
// import { namedInjectedWallet } from "./namedInjectedWallet/namedInjectedWallet";
import config from "../../utils/config";

// Inspired by: https://github.com/rainbow-me/rainbowkit/blob/main/packages/rainbowkit/src/wallets/getDefaultWallets.ts
export const getAppWallets = ({
  appName,
  chains,
}: {
  appName: string;
  chains: Chain[];
}): {
  connectors: ReturnType<typeof connectorsForWallets>;
  wallets: WalletList;
} => {
  const needsMock =
    typeof window !== "undefined" &&
    typeof (window as any).mockSigner !== "undefined";

  const wallets: WalletList = [
    {
      groupName: "Popular",
      wallets: [
        // () => namedInjectedWallet({ chains, shimDisconnect: true }),
        () => gnosisSafe({ chains }),
        () => braveWallet(),
        () => metaMaskWallet({
          projectId: config.walletConnectProjectId,
        }),
        () => walletConnectWallet({
          projectId: config.walletConnectProjectId,
        }),
        () => coinbaseWallet({ appName }),
        () => bitkeep({ chains, shimDisconnect: true }),
        () =>rainbowWallet({
          projectId: config.walletConnectProjectId,
        }),
        ...(needsMock ? [() => mockConnector({ chains })] : []),
        // wallet.trust({ chains }),
      ],
    },
    // {
    //   groupName: "Other",
    //   wallets: [
    //     wallet.rainbow({ chains }),
    //     wallet.ledger({ chains }),
    //     wallet.imToken({ chains }),
    //   ],
    // },
  ];

  return {
    connectors: connectorsForWallets(wallets, {
      appName: "Superfluid Dashboard",
      projectId: config.walletConnectProjectId
    }),
    wallets,
  };
};
