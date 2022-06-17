import { ensApi } from "../features/ens/ensApi.slice";
import { getAddress } from "../utils/memoizedEthersUtils";

interface AddressNameResult {
  addressChecksummed: string;
  name: string | "";
}

const useAddressName = (address: string): AddressNameResult => {
  const ensQuery = ensApi.useLookupAddressQuery(address);
  return {
    addressChecksummed: getAddress(address),
    name: ensQuery.data?.name ?? "",
  };
};

export default useAddressName;