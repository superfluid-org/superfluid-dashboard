import { useEffect, useState } from "react";
import { addressBookSelectors } from "../features/addressBook/addressBook.slice";
import { useAppSelector } from "../features/redux/store";
import { getAddress } from "../utils/memoizedEthersUtils";
import { AddressNameResult } from "./useAddressName";
import { whoisApi, SuperfluidProfile } from "../features/whois/whoisApi.slice";

interface AddressNames {
  [any: string]: AddressNameResult;
}

const useAddressNames = (addresses: string[]): AddressNames => {
  const [whoisQueryTrigger] = whoisApi.useLazyGetProfileQuery();
  const [whoisProfiles, setWhoisProfiles] = useState<{ [any: string]: SuperfluidProfile | null }>({});

  const addressBookNames = useAppSelector((state) =>
    addressBookSelectors.selectByAddresses(state, addresses)
  );

  useEffect(() => {
    Promise.allSettled(
      addresses.map((address) => whoisQueryTrigger(address, true))
    ).then((whoisResults) => {
      setWhoisProfiles(
        whoisResults.reduce((whoisProfilesMap, whoisResult) => {
          if (whoisResult.status === "rejected" || !whoisResult.value.data) {
            return whoisProfilesMap;
          }

          return {
            ...whoisProfilesMap,
            [whoisResult.value.originalArgs.toLowerCase()]:
              whoisResult.value.data,
          };
        }, {})
      );
    });
  }, [addresses, whoisQueryTrigger]);

  return addresses.reduce((mappedAddresses, address) => {
    const addressChecksummed = getAddress(address);
    const addressBookName =
      addressBookNames.find(
        (addressBookName) =>
          addressBookName.address.toLowerCase() === address.toLowerCase()
      )?.name || "";
    
    const whoisProfile = whoisProfiles[address.toLowerCase()];
    const ensName = whoisProfile?.ENS?.handle;
    const lensName = whoisProfile?.Lens?.handle?.replace("lens/", "");
    const farcasterName = whoisProfile?.Farcaster?.handle;
    const alfaFrensName = whoisProfile?.AlfaFrens?.handle;
    const torexName = whoisProfile?.TOREX?.handle;

    const primaryAvatarUrl = whoisProfile?.recommendedAvatar ?? null;

    const primaryName = addressBookName || whoisProfile?.recommendedName || "";

    return {
      ...mappedAddresses,
      [address]: {
        addressChecksummed,
        name: primaryName,
        ensName,
        lensName,
        torexName,
        whoisProfile,
        farcasterName,
        alfaFrensName,
        primaryAvatarUrl,
      },
    };
  }, {} as AddressNames);
};

export default useAddressNames;
