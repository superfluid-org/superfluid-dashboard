export interface MoralisPortfolioRequest {
  address: string;
}

export interface MoralisPortfolioAsset {
  id: string;
  chainId: string;
  tokenAddress?: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceRaw: string;
  priceUsd?: number;
  valueUsd?: number;
  changePercent24h?: number;
  portfolioPercentage?: number;
  logo?: string;
  nativeToken: boolean;
  possibleSpam: boolean;
  verifiedContract: boolean;
  securityScore?: number;
}

export interface MoralisDefiToken {
  address?: string;
  name: string;
  symbol: string;
  balance: string;
  valueUsd?: number;
  logo?: string;
}

export interface MoralisDefiPosition {
  id: string;
  chainId: string;
  protocolId: string;
  protocolName: string;
  protocolLogo?: string;
  protocolUrl?: string;
  positionType: string;
  valueUsd?: number;
  unclaimedUsd?: number;
  isDebt: boolean;
  healthFactor?: number;
  tokens: MoralisDefiToken[];
}

export interface MoralisPnlSummary {
  period: "all";
  chainIds: string[];
  totalTrades: number;
  totalTradeVolumeUsd?: number;
  realizedProfitUsd?: number;
  realizedProfitPercent?: number;
  buys: number;
  sells: number;
}

export type MoralisOptionalFeature = "defi" | "pnl";

export interface MoralisPortfolioResponse {
  provider: "moralis";
  totalBalanceUsd: number;
  defiValueUsd: number;
  assets: MoralisPortfolioAsset[];
  defiPositions: MoralisDefiPosition[];
  pnl?: MoralisPnlSummary;
  failedChains: string[];
  unsupportedChains: string[];
  tokenResultLimited: boolean;
  defiResultLimited: boolean;
  optionalFeaturesUnavailable: MoralisOptionalFeature[];
  optionalFeatureErrors?: Partial<Record<MoralisOptionalFeature, string>>;
}
