import { NetworkCustomToken } from "../features/customTokens/customTokens.slice";

export function parseV1CustomTokens(v1CustomTokens: string) {
  const parsedV1CustomTokens: { [chainId: string]: string } =
    JSON.parse(v1CustomTokens);

  return Object.entries(parsedV1CustomTokens).reduce(
    (parsedCustomTokens, [chainId, tokensString]) => {
      return parsedCustomTokens.concat(
        tokensString.split(",").map((tokenAddress) => {
          return {
            chainId: Number(chainId),
            customToken: tokenAddress,
          };
        })
      );
    },
    [] as NetworkCustomToken[]
  );
}
