import { TokenMinimal, SuperTokenPair, UnderlyingTokenType, UnderlyingToken } from '../redux/endpoints/adHocSubgraphEndpoints';

export enum RestorationType {
  Downgrade = 1,
  Upgrade = 2,
  Approve = 3
}

export interface SuperTokenDowngradeRestoration {
  type: RestorationType.Downgrade;
  chainId: number;
  tokenUpgrade: SuperTokenPair;
  amountWei: string;
}

export interface SuperTokenUpgradeRestoration {
  type: RestorationType.Upgrade;
  chainId: number;
  tokenUpgrade: SuperTokenPair;
  amountWei: string;
}

export interface ApproveAllowanceRestoration {
  type: RestorationType.Approve;
  chainId: number;
  token: UnderlyingToken;
  amountWei: string;
}

export type TransactionRestorations = SuperTokenDowngradeRestoration | SuperTokenUpgradeRestoration | ApproveAllowanceRestoration;