import { useMemo } from "react";
import { Network } from "../network/networks";
import { SuperTokenPair } from "../redux/endpoints/tokenTypes";
import { useTokenPairsQuery } from "./useTokenPairsQuery";

export const useTokenPairQuery = ({
  network,
  tokenPair,
}: {
  network: Network;
  tokenPair?: {
    superTokenAddress: string;
    underlyingTokenAddress: string;
  };
}) => {
  const { data: tokenPairs } = useTokenPairsQuery({ network });

  const tokenPairObjects: SuperTokenPair | undefined = useMemo(() => {
    return tokenPair
      ? tokenPairs.find(
          (x) =>
            x.superToken.address.toLowerCase() ===
              tokenPair.superTokenAddress.toLowerCase() &&
            x.underlyingToken.address.toLowerCase() ===
              tokenPair.underlyingTokenAddress.toLowerCase()
        )
      : undefined;
  }, [network, tokenPairs, tokenPair?.superTokenAddress, tokenPair?.underlyingTokenAddress]);

  const { superToken, underlyingToken } = tokenPairObjects ?? {};
  return { superToken, underlyingToken };
};
