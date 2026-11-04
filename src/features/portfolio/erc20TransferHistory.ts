export interface ERC20TransferHistoryCursor {
  incoming: string | null;
  outgoing: string | null;
}

export interface ERC20TransferHistoryItem {
  id: string;
  transactionHash: string;
  blockNumber: string;
  timestamp: string;
  from: string;
  to: string;
  rawValue: string;
  decimals?: number;
}

export interface ERC20TransferHistoryRequest {
  address: string;
  tokenAddress: string;
  chainId: number;
  cursor?: ERC20TransferHistoryCursor;
}

export interface ERC20TransferHistoryResponse {
  transfers: ERC20TransferHistoryItem[];
  cursor: ERC20TransferHistoryCursor;
  hasMore: boolean;
}
