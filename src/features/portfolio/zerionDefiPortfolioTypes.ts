export type ZerionPositionType =
  | "deposit"
  | "investment"
  | "loan"
  | "locked"
  | "reward"
  | "staked"
  | "wallet"
  | string;

export interface ZerionDefiPortfolioRequest {
  address: string;
}

export interface ZerionDefiOverview {
  total: number;
  change24h?: number;
  changePercent24h?: number;
  defiTotal: number;
  stakedTotal: number;
  byPositionType: Record<string, number>;
  byChain: Record<string, number>;
}

export interface ZerionDefiPosition {
  id: string;
  chainId: string;
  name: string;
  symbol: string;
  iconUrl?: string;
  quantity: string;
  value?: number;
  price?: number;
  changePercent24h?: number;
  positionType: ZerionPositionType;
  isLiquidityPosition: boolean;
  protocol?: string;
  protocolModule?: string;
  protocolIconUrl?: string;
  groupId?: string;
  verified: boolean;
}

export interface ZerionNftPosition {
  id: string;
  chainId: string;
  contractAddress?: string;
  tokenId?: string;
  name: string;
  collectionName?: string;
  imageUrl?: string;
  amount: string;
  value?: number;
  price?: number;
  interface?: string;
}

export interface ZerionDefiPortfolioResponse {
  provider: "zerion";
  overview: ZerionDefiOverview;
  positions: ZerionDefiPosition[];
  positionsUnavailable: boolean;
  nfts: ZerionNftPosition[];
  nftsPending: boolean;
  nftsUnavailable: boolean;
  hasMoreNfts: boolean;
  nextNftCursor?: string;
  nftPageSize: number;
}

export interface ZerionNftPageRequest {
  address: string;
  chainId?: string;
  cursor?: string;
  nftPage: true;
}

export interface ZerionNftPageResponse {
  provider: "zerion";
  chainId?: string;
  nfts: ZerionNftPosition[];
  nftsPending: boolean;
  nextNftCursor?: string;
  pageSize: number;
}
