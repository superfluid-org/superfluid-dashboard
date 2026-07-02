import {
  DEFAULT_CONNECTOR_ID,
  superfluidWallet,
} from "@d10r/wagmi-superfluid-wallet";
import type { CreateConnectorFn } from "wagmi";
import appConfig from "../../utils/config";

export const SUPERFLUID_WALLET_CONNECTOR_ID = DEFAULT_CONNECTOR_ID;

export function getSuperfluidWalletConnector(): CreateConnectorFn {
  const { url } = appConfig.superfluidWallet;
  const sf = superfluidWallet({ walletUrl: url });
  return sf.connector();
}
