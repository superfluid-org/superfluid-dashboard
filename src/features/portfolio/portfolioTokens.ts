export interface PortfolioToken {
  chainId: number;
  tokenAddress: string;
  balance: string;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  priceUsd?: number;
  priceUpdatedAt?: string;
  valueUsd?: number;
  nativeToken: boolean;
}

export interface PortfolioTokensResponse {
  tokens: PortfolioToken[];
  fallbackChainIds: number[];
}

export interface PortfolioTokensRequest {
  address: string;
  chainIds: number[];
  includeNativeTokens?: boolean;
}
