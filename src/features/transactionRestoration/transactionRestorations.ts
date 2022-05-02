import { TokenMinimal, WrappedSuperTokenPair } from '../redux/endpoints/adHocSubgraphEndpoints';

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

export interface ApproveAllowanceRestoration {
  chainId: number;
  token: TokenMinimal;
  amountWei: string;
}

export type TransactionRestorations = SuperTokenDowngradeRestoration | SuperTokenUpgradeRestoration | ApproveAllowanceRestoration;