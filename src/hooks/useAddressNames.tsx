import { useEffect, useState } from "react";
import { addressBookSelectors } from "../features/addressBook/addressBook.slice";
import { ensApi } from "../features/ens/ensApi.slice";
import { useAppSelector } from "../features/redux/store";
import { getAddress } from "../utils/memoizedEthersUtils";
import { AddressNameResult } from "./useAddressName";
import { lensApi } from "../features/lens/lensApi.slice";
import { getTOREXInfo } from "../features/torex/torexAddresses";

interface AddressNames {
  [any: string]: AddressNameResult;
}

const useAddressNames = (addresses: string[]): AddressNames => {
  const [ensLookupQueryTrigger] = ensApi.useLazyLookupAddressQuery();
  const [lensLookupQueryTrigger] = lensApi.useLazyLookupAddressQuery();

  const [ensNames, setEnsNames] = useState<{ [any: string]: string }>({});
  const [lensNames, setLensNames] = useState<{ [any: string]: string }>({});

  const addressBookNames = useAppSelector((state) =>
    addressBookSelectors.selectByAddresses(state, addresses)
  );

  useEffect(() => {
    Promise.allSettled(
      addresses.map((address) => ensLookupQueryTrigger(address, true))
    ).then((ensResults) => {
      setEnsNames(
        ensResults.reduce((ensNamesMap, ensResult) => {
          if (ensResult.status === "rejected" || !ensResult.value.data) {
            return ensNamesMap;
          }

          return {
            ...ensNamesMap,
            [ensResult.value.data.address.toLowerCase()]:
              ensResult.value.data.name,
          };
        }, {})
      );
    });

    Promise.allSettled(
      addresses.map((address) => lensLookupQueryTrigger(address, true))
    ).then((lensResults) => {
      setLensNames(
        lensResults.reduce((ensNamesMap, lensResult) => {
          if (lensResult.status === "rejected" || !lensResult.value.data) {
            return ensNamesMap;
          }

          return {
            ...ensNamesMap,
            [lensResult.value.data.address.toLowerCase()]:
              lensResult.value.data.name,
          };
        }, {})
      );
    });
  }, [addresses, ensLookupQueryTrigger, lensLookupQueryTrigger]);

  return addresses.reduce((mappedAddresses, address) => {
    const addressChecksummed = getAddress(address);
    const addressBookName =
      addressBookNames.find(
        (addressBookName) =>
          addressBookName.address.toLowerCase() === address.toLowerCase()
      )?.name || "";
    const ensName = ensNames[address.toLowerCase()];
    const lensName = lensNames[address.toLowerCase()];
    
    const torexInfo = getTOREXInfo(addressChecksummed);
    const torexName = torexInfo?.name;

    return {
      ...mappedAddresses,
      [address]: {
        addressChecksummed,
        name: addressBookName || torexName || ensName || lensName || "",
        ensName,
        lensName,
        torexName,
      },
    };
  }, {} as AddressNames);
};

export default useAddressNames;
