import { addressBookSelectors } from "../features/addressBook/addressBook.slice";
import sanitizeAddressBookName from "../features/addressBook/sanitizeAddressBookName";
import { ensApi } from "../features/ens/ensApi.slice";
import { useAppSelector } from "../features/redux/store";
import { getAddress } from "../utils/memoizedEthersUtils";

export interface AddressNameResult {
  addressChecksummed: string;
  name: string | "";
  ensName?: string;
}

const useAddressName = (address: string): AddressNameResult => {
  const ensLookupQuery = ensApi.useLookupAddressQuery(address);
  const addressChecksummed = getAddress(address);

  const addressBookName = sanitizeAddressBookName(
    useAppSelector(
      (state) =>
        addressBookSelectors.selectById(state.addressBook, addressChecksummed)
          ?.name ?? ""
    )
  );

  const ensName = ensLookupQuery.data?.name;

  return {
    addressChecksummed,
    name: addressBookName || ensName || "",
    ensName,
  };
};

export default useAddressName;
