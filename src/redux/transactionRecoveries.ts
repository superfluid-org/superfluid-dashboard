import { TokenUpgradeDowngradePair } from './endpoints/adHocSubgraphEndpoints';

export interface SuperTokenDowngradeRecovery {
  chainId: number;
  tokenUpgrade: TokenUpgradeDowngradePair;
  amountWei: string;
}

export interface SuperTokenUpgradeRecovery {
  chainId: number;
  tokenUpgrade: TokenUpgradeDowngradePair;
  amountWei: string;
}

export type TransactionRecoveries = SuperTokenDowngradeRecovery | SuperTokenUpgradeRecovery;