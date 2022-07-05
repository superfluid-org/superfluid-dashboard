import {
  Chain,
  connectorsForWallets,
  wallet,
  WalletList,
} from "@rainbow-me/rainbowkit";
import gnosisSafe from "./gnosisSafeWalletConnector/gnosisSafe";

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
        // wallet.walletConnect({ chains }),
        wallet.coinbase({ appName, chains }),
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
