export interface AlchemyActivityRequest {
  address: string;
  chainIds: number[];
}

export interface AlchemyNetworkFailure {
  chainId: number;
  operation?: string;
  message: string;
}

export type AlchemyActivityDirection = "received" | "sent" | "self";

export interface AlchemyActivityItem {
  id: string;
  chainId: number;
  transactionHash: string;
  blockNumber: string;
  timestamp: string;
  from: string;
  to: string;
  direction: AlchemyActivityDirection;
  category: string;
  asset: string;
  value?: string;
  tokenAddress?: string;
  tokenId?: string;
}

export interface AlchemyActivityResponse {
  activity: AlchemyActivityItem[];
  truncated: boolean;
  failures: AlchemyNetworkFailure[];
}

export interface AlchemyNftRequest {
  address: string;
  chainIds: number[];
}

export interface AlchemyNftItem {
  id: string;
  chainId: number;
  contractAddress: string;
  tokenId: string;
  tokenType: string;
  name: string;
  description?: string;
  imageUrl?: string;
  collectionName?: string;
  collectionImageUrl?: string;
  acquiredAt?: string;
  floorPrice?: number;
  isSpam: boolean;
}

export interface AlchemyNftResponse {
  nfts: AlchemyNftItem[];
  totalCount: number;
  truncated: boolean;
  failures: AlchemyNetworkFailure[];
}
