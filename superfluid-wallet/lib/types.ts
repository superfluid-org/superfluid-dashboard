import { Address, Hex, ProviderRpcErrorCode } from 'viem';

// Define supported RPC methods
export type SupportedMethod =
  | 'eth_requestAccounts'
  | 'eth_signTransaction'
  | 'eth_sign'
  | 'personal_sign';

// Define method-specific result types
export type MethodResult = {
  eth_requestAccounts: [{ accounts: Address[]; organizationId: string }];
  eth_signTransaction: Hex;
  eth_sign: Hex;
  personal_sign: Hex;
};

// Message type with proper typing based on method
export type Message<M extends SupportedMethod> = {
  method: M;
  result?: MethodResult[M];
  error?: {
    code: ProviderRpcErrorCode;
    message: string;
    data?: any;
  };
};

// Configuration object for the messenger
export type MessengerConfig = {
  targetOrigin?: string;
};
