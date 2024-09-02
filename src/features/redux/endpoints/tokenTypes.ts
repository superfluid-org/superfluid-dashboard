export enum TokenType {
  NativeAssetUnderlyingToken = 1,
  ERC20UnderlyingToken = 2,
  NativeAssetSuperToken = 3,
  WrapperSuperToken = 4,
  PureSuperToken = 5,
}

export type UnderlyingTokenType =
  | TokenType.NativeAssetUnderlyingToken
  | TokenType.ERC20UnderlyingToken;

export type SuperTokenType =
  | TokenType.NativeAssetSuperToken
  | TokenType.WrapperSuperToken
  | TokenType.PureSuperToken;

export interface TokenMinimal {
  type: TokenType;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  isSuperToken: boolean;
  logoURI?: string;
}

export interface SuperTokenMinimal extends TokenMinimal {
  type: SuperTokenType;
  decimals: 18;
  isListed: boolean;
  isSuperToken: true;
  underlyingAddress: string | undefined | null;
}

export interface ERC20TokenMinimal extends TokenMinimal {
  type: TokenType.ERC20UnderlyingToken;
  isSuperToken: false;
}

/**
 * A dummy address to signal that the token is the blockchain's coin (native asset).
 */
export const NATIVE_ASSET_ADDRESS = "native-asset";
// TODO: This might not be such a good idea.

export interface NativeAsset extends TokenMinimal {
  type: TokenType.NativeAssetUnderlyingToken;
  address: typeof NATIVE_ASSET_ADDRESS;
  decimals: 18;
  isSuperToken: false;
}

export type UnderlyingTokenMinimal = ERC20TokenMinimal | NativeAsset;

export type SuperTokenPair = {
  superToken: SuperTokenMinimal;
  underlyingToken: UnderlyingTokenMinimal;
};

// Helper functions
export const isUnderlying = (
  x: TokenMinimal
): x is ERC20TokenMinimal | NativeAsset =>
  x.type === TokenType.NativeAssetUnderlyingToken ||
  x.type === TokenType.ERC20UnderlyingToken;

export const isWrappable = (x: { type: TokenType }): boolean =>
  x.type === TokenType.NativeAssetSuperToken ||
  x.type === TokenType.WrapperSuperToken;

export const isSuper = (x: TokenMinimal): x is SuperTokenMinimal =>
  isWrappable(x) || x.type === TokenType.PureSuperToken;