import { getAddress } from "ethers/lib/utils";
import { ensApi } from "../features/ens/ensApi.slice";

interface AddressDisplay {
  checksumAddress: string;
  name: string | "";
}

const useAddressDisplay = (address: string) => {
  const ensName = ensApi.useLookupAddressQuery(address);
  const checksumAddress = getAddress(address);
  return {
    checksumAddress: checksumAddress,
    displayName: ensName ?? "",
  };
};

export default useAddressDisplay;
