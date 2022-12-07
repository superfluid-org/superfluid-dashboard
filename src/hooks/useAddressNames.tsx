import { useEffect } from "react";
import { addressBookSelectors } from "../features/addressBook/addressBook.slice";
import { ensApi } from "../features/ens/ensApi.slice";
import { useAppSelector } from "../features/redux/store";
import { getAddress } from "../utils/memoizedEthersUtils";
import { AddressNameResult } from "./useAddressName";

interface AddressNames {
  [any: string]: AddressNameResult;
}
const useAddressNames = (addresses: string[]): AddressNames => {
  const [ensLookupQueryTrigger] = ensApi.useLazyLookupAddressQuery();

  const addressBookNames = useAppSelector((state) =>
    addressBookSelectors.selectByAddresses(state, addresses)
  );

  useEffect(() => {
    Promise.allSettled(
      addresses.map((address) => ensLookupQueryTrigger(address))
    ).then((ensResults) => {
      console.log({ ensResults });
    });
  }, [addresses, ensLookupQueryTrigger]);

  return addresses.reduce((mappedAddresses, address) => {
    const addressBookName =
      addressBookNames.find(
        (addressBookName) =>
          addressBookName.address.toLowerCase() === address.toLowerCase()
      )?.name || "";
    const ensName = "";

    return {
      ...mappedAddresses,
      [address]: {
        addressChecksummed: getAddress(address),
        name: addressBookName || ensName || "",
        ensName,
      },
    };
  }, {} as AddressNames);
};

export default useAddressNames;
