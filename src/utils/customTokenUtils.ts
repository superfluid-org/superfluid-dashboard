import { NetworkCustomTokens } from "../features/customTokens/customTokens.slice";

export function parseV1CustomTokens(v1CustomTokens: string) {
  const parsedV1CustomTokens: { [chainId: string]: string } =
    JSON.parse(v1CustomTokens);

  return Object.entries(parsedV1CustomTokens).map(
    ([chainId, tokensString]) =>
      ({
        chainId: Number(chainId),
        customTokens: tokensString.split(","),
      } as NetworkCustomTokens)
  );
}
