import { getAddress } from "ethers/lib/utils";
import { ensApi } from "../features/ens/ensApi.slice";

interface AddressNameResult {
  checksumHex: string;
  name: string | "";
}

const useAddressName = (address: string): AddressNameResult => {
  const ensQuery = ensApi.useLookupAddressQuery(address);
  const checksumAddress = getAddress(address);
  return {
    checksumHex: checksumAddress,
    name: ensQuery.data?.name ?? "",
  };
};

export default useAddressName;