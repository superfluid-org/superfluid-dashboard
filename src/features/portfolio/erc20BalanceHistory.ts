export interface ERC20BalanceHistoryRequest {
  address: string;
  tokenAddress: string;
  chainId: number;
  samples: Array<{ blockNumber: string; timestamp: string }>;
}

export interface ERC20BalanceHistoryPoint {
  blockNumber: string;
  timestamp: string;
  balance: string;
}

export interface ERC20BalanceHistoryResponse {
  points: ERC20BalanceHistoryPoint[];
  sampledTransferBlocks: number;
}
