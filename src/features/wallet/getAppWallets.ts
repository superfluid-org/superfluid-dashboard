import {
  Chain,
  connectorsForWallets,
  wallet,
  WalletList,
} from "@rainbow-me/rainbowkit";
import gnosisSafe from "./gnosisSafeWalletConnector/gnosisSafe";
import mockConnector from "./mockConnector/mockConnector";

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
  const needsInjectedWalletFallback =
    typeof window !== "undefined" &&
    window.ethereum &&
    !window.ethereum.isMetaMask &&
    !window.ethereum.isCoinbaseWallet;

  const needsMock =
    typeof window !== "undefined" &&
    typeof (window as any).mockSigner !== "undefined";

  const wallets: WalletList = [
    {
      groupName: "Popular",
      wallets: [
        wallet.metaMask({
          chains,
          shimDisconnect: true,
        }),
        wallet.brave({ chains, shimDisconnect: true }),
        gnosisSafe({ chains }),
        ...(needsInjectedWalletFallback
          ? [wallet.injected({ chains, shimDisconnect: true })]
          : []),
        wallet.walletConnect({ chains }),
        wallet.coinbase({ appName, chains }),
        ...(needsMock
          ? [mockConnector({ chains })]
          : [])
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
    connectors: connectorsForWallets(wallets),
    wallets,
  };
};
