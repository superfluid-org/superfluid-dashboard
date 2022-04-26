import { WrappedSuperTokenPair } from '../redux/endpoints/adHocSubgraphEndpoints';

export interface SuperTokenDowngradeRestoration {
  chainId: number;
  tokenUpgrade: WrappedSuperTokenPair;
  amountWei: string;
}

export interface SuperTokenUpgradeRestoration {
  chainId: number;
  tokenUpgrade: WrappedSuperTokenPair;
  amountWei: string;
}

export type TransactionRestorations = SuperTokenDowngradeRestoration | SuperTokenUpgradeRestoration;