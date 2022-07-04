import { SafeConnector } from "@gnosis.pm/safe-apps-wagmi";
import { Chain, Wallet } from "@rainbow-me/rainbowkit";

export interface GnosisSafeOptions {
  chains: Chain[];
}

const gnosisSafe = ({ chains }: GnosisSafeOptions): Wallet => {
  return {
    id: "gnosis-safe",
    name: "Gnosis Safe",
    shortName: "Gnosis Safe",
    iconUrl:
      "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/8af10ecd-e612-4f0b-afd4-4e5127054586/gnosis_safe_multisig_2019_logo_rgb_sponsor_black.svg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20220630%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20220630T132054Z&X-Amz-Expires=86400&X-Amz-Signature=b431403616825047ad07f5f5d92e67692703b3ebfafd4f8d5b235bf26bdc209c&X-Amz-SignedHeaders=host&response-content-disposition=filename%20%3D%22gnosis_safe_2019_logo_rgb_sponsor_black.svg%22&x-id=GetObject",
    iconBackground: "#008168",
    createConnector: () => ({
      connector: new SafeConnector({ chains }),
    }),
  };
};

export default gnosisSafe;
