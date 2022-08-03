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

export type TokenMinimal = {
  type: UnderlyingTokenType | SuperTokenType;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  isListed?: boolean;
};

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

export type SuperTokenMinimal = {
  type: SuperTokenType;
  address: string;
  name: string;
  symbol: string;
  isListed?: boolean;
  decimals: number;
};

export type ERC20TokenMinimal = {
  type: TokenType.ERC20UnderlyingToken;
  address: string;
  name: string;
  symbol: string;
  isListed?: boolean;
  decimals: number;
};
/**
 * A dummy address to signal that the token is the blockchain's coin (native asset).
 */

export const NATIVE_ASSET_ADDRESS = "native-asset";

export type NativeAsset = {
  type: TokenType.NativeAssetUnderlyingToken;
  address: typeof NATIVE_ASSET_ADDRESS;
  name: string;
  symbol: string;
  decimals: number;
};

export type PureSuperToken = {
  address: string;
  name: string;
  symbol: string;
};

export type UnderlyingToken = {
  address: string;
  name: string;
  symbol: string;
};

export type SuperTokenPair = {
  superToken: SuperTokenMinimal;
  underlyingToken: ERC20TokenMinimal | NativeAsset;
};
