import { TokenUpgradeDowngradePair } from '../redux/endpoints/adHocSubgraphEndpoints';

export interface SuperTokenDowngradeRestoration {
  chainId: number;
  tokenUpgrade: TokenUpgradeDowngradePair;
  amountWei: string;
}

export interface SuperTokenUpgradeRestoration {
  chainId: number;
  tokenUpgrade: TokenUpgradeDowngradePair;
  amountWei: string;
}

export type TransactionRestorations = SuperTokenDowngradeRestoration | SuperTokenUpgradeRestoration;