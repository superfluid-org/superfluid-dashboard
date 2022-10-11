import { Address } from "@superfluid-finance/sdk-core";
import { useCallback } from "react";
import config from "../../utils/config";
import { assetApiSlice } from "./tokenManifestSlice";

export function useWatchAsset(
  address: Address,
  symbol: string,
  decimals: number
) {
  const [tokenManifestTrigger] = assetApiSlice.useLazyTokenManifestQuery();

  return useCallback(
    () =>
      new Promise(async (resolve, reject) => {
        try {
          const tokenImage = await tokenManifestTrigger({
            tokenSymbol: symbol,
          })
            .then((response) =>
              response.data?.svgIconPath
                ? `${config.tokenIconUrl}${response.data?.svgIconPath}`
                : undefined
            )
            .catch(() => undefined);

          window?.ethereum
            ?.request({
              method: "wallet_watchAsset",
              params: {
                type: "ERC20",
                options: {
                  address,
                  symbol,
                  decimals,
                  image: tokenImage,
                },
              },
            })
            .then((x) => resolve({ response: x }))
            .catch(reject);
        } catch (err) {
          reject(err);
        }
      }),
    [tokenManifestTrigger, address, symbol, decimals]
  );
}
