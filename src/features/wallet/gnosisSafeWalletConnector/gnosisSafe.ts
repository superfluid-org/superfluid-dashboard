import { SafeConnector } from "@wagmi/connectors/safe";
import { Chain, Wallet } from "@rainbow-me/rainbowkit";

export interface GnosisSafeOptions {
  chains: Chain[];
}

const gnosisSafe = ({ chains }: GnosisSafeOptions): Wallet => {
  return {
    id: "gnosis-safe",
    name: "Gnosis Safe",
    shortName: "Gnosis Safe",
    iconUrl: "/icons/ecosystem/gnosis_safe_2019_logo_rgb_sponsor_darkblue.svg",
    iconBackground: "#008168",
    createConnector: () => ({
      connector: new SafeConnector({
        chains,
        options: {
          allowedDomains: [/gnosis-safe.io$/, /app.safe.global$/],
          debug: false,
        },
      }),
    }),
  };
};

export default gnosisSafe;
