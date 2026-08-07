export interface AnkrPortfolioRequest {
  address: string;
}

export interface AnkrPortfolioAsset {
  id: string;
  blockchain: string;
  tokenAddress?: string;
  name: string;
  symbol: string;
  tokenType: string;
  decimals: number;
  balance: string;
  balanceRaw: string;
  priceUsd?: number;
  valueUsd?: number;
  thumbnail?: string;
}

export interface AnkrPortfolioNft {
  id: string;
  blockchain: string;
  contractAddress: string;
  contractType: string;
  collectionName?: string;
  name: string;
  symbol?: string;
  tokenId: string;
  quantity?: string;
  imageUrl?: string;
}

export interface AnkrPortfolioResponse {
  provider: "ankr";
  totalBalanceUsd: number;
  assets: AnkrPortfolioAsset[];
  nfts: AnkrPortfolioNft[];
  nftResultLimited: boolean;
  interactions: string[];
  optionalFeaturesUnavailable: Array<"nfts" | "interactions">;
}
