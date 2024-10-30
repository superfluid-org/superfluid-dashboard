import { skipToken } from "@reduxjs/toolkit/dist/query";
import { platformApi } from "../features/redux/platformApi/platformApi";
import { Network } from "../features/network/networks";

export function useWhitelist({ accountAddress, network }: { accountAddress?: string, network: Network }) {
  const { isPlatformWhitelisted_, isLoading: isWhitelistLoading } =
    platformApi.useIsAccountWhitelistedQuery(
      accountAddress
        ? {
          chainId: network.id,
          account: accountAddress?.toLowerCase(),
        }
        : skipToken,
      {
        selectFromResult: (queryResult) => ({
          ...queryResult,
          isPlatformWhitelisted_: !!queryResult.data,
        }),
      }
    );

  const isPlatformWhitelisted = Boolean(isPlatformWhitelisted_ || network?.testnet);

  return {
    isPlatformWhitelisted,
    isWhitelistLoading
  }
}