import { Chain, Wallet } from "@rainbow-me/rainbowkit";
import { safe } from 'wagmi/connectors'

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
    createConnector: () => safe({
      allowedDomains: [
        /gnosis-safe.io$/,
        /app.safe.global$/,
        /^https:\/\/(?:[^\/]+\.)?coinshift\.xyz$/,
        /^http:\/\/(localhost|127\.0\.0\.1):(\d+)$/,
      ],
      debug: false,
    }),
  };
};

export default gnosisSafe;
