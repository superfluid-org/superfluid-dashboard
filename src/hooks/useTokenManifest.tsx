import { useEffect, useState } from 'react';
import axios from 'axios';

interface TokenManifest {
  version: string;
  type: string;
  svgIconPath: string;
  isSuperToken: boolean;
  superTokenType: string;
  superTokenCustomProperties: string[];
  coingeckoId: string;
  defaultColor: string;
}

const useTokenManifest = (symbol: string): TokenManifest | null => {
  const [tokenManifest, setTokenManifest] = useState<TokenManifest | null>(
    null,
  );

  useEffect(() => {
    // TODO optimize to prevent duplicate queries if multiple token components are on the same page
    axios
      .get(
        `https://raw.githubusercontent.com/superfluid-finance/assets/master/public/tokens/${symbol.toLowerCase()}/manifest.json`,
      )
      .then((response) => {
        if (response.status === 200) {
          setTokenManifest(response.data);
        }
      })
      .catch((e) => console.error(e));
  }, [symbol]);
  return tokenManifest;
};

export default useTokenManifest;
