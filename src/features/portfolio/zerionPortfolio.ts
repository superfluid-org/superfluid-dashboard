export type ZerionChartPeriod =
  | "day"
  | "week"
  | "month"
  | "3months"
  | "6months"
  | "year";

export type ZerionPositionType =
  | "wallet"
  | "deposit"
  | "loan"
  | "locked"
  | "staked"
  | "reward"
  | "investment"
  | string;

export interface ZerionPortfolioRequest {
  address: string;
  chartPeriod?: ZerionChartPeriod;
}

export interface ZerionPortfolioOverview {
  total: number;
  change24h?: number;
  changePercent24h?: number;
  byPositionType: Record<string, number>;
  byChain: Record<string, number>;
}

export interface ZerionPortfolioPosition {
  id: string;
  chainId: string;
  tokenAddress?: string;
  name: string;
  symbol: string;
  iconUrl?: string;
  quantity: string;
  decimals: number;
  price?: number;
  value?: number;
  change24h?: number;
  changePercent24h?: number;
  positionType: ZerionPositionType;
  protocol?: string;
  protocolModule?: string;
  protocolIconUrl?: string;
  groupId?: string;
  dappId?: string;
  verified: boolean;
}

export interface ZerionChartPoint {
  timestamp: number;
  value: number;
}

export interface ZerionRateLimit {
  remainingSecond?: number;
  remainingDay?: number;
  remainingMonth?: number;
}

export interface ZerionPortfolioResponse {
  provider: "zerion";
  overview: ZerionPortfolioOverview;
  positions: ZerionPortfolioPosition[];
  chart: {
    period: ZerionChartPeriod;
    points: ZerionChartPoint[];
    unavailable: boolean;
  };
  rateLimit?: ZerionRateLimit;
}
