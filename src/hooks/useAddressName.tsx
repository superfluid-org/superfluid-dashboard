import { addressBookSelectors } from "../features/addressBook/addressBook.slice";
import { ensApi } from "../features/ens/ensApi.slice";
import { useAppSelector } from "../features/redux/store";
import { getAddress } from "../utils/memoizedEthersUtils";

interface AddressNameResult {
  addressChecksummed: string;
  name: string | "";
}

const useAddressName = (address: string): AddressNameResult => {
  const ensLookupQuery = ensApi.useLookupAddressQuery(address);
  const addressChecksummed = getAddress(address);

  const addressBookName = useAppSelector(
    (state) => addressBookSelectors.selectById(state.addressBook, address)?.name
  );

  return {
    addressChecksummed,
    name: addressBookName || ensLookupQuery.data?.name || "",
  };
};

export default useAddressName;
