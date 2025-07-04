import { addressBookSelectors } from "../features/addressBook/addressBook.slice";
import sanitizeAddressBookName from "../features/addressBook/sanitizeAddressBookName";
import { whoisApi, SuperfluidProfile } from "../features/whois/whoisApi.slice";
import { useAppSelector } from "../features/redux/store";
import { getAddress } from "../utils/memoizedEthersUtils";
import { getTOREXInfo } from "../features/torex/torexAddresses";

export interface AddressNameResult {
  addressChecksummed: string;
  name: string | "";
  ensName?: string;
  lensName?: string;
  torexName?: string;
  whoisProfile?: SuperfluidProfile | null;
  farcasterName?: string;
  alfaFrensName?: string;
  primaryAvatarUrl?: string | null;
}

const useAddressName = (address: string): AddressNameResult => {
  const whoisQuery = whoisApi.useGetProfileQuery(address);
  const addressChecksummed = getAddress(address);

  const addressBookName = sanitizeAddressBookName(
    useAppSelector(
      (state) =>
        addressBookSelectors.selectById(state.addressBook, addressChecksummed)
          ?.name ?? ""
    )
  );

  const torexInfo = getTOREXInfo(addressChecksummed);
  const torexName = torexInfo?.name;

  const whoisProfile = whoisQuery.data;
  const ensName = whoisProfile?.ENS?.handle;
  const lensName = whoisProfile?.Lens?.handle?.replace("lens/", "");
  const farcasterName = whoisProfile?.Farcaster?.handle;
  const alfaFrensName = whoisProfile?.AlfaFrens?.handle;

  const primaryAvatarUrl = 
    whoisProfile?.ENS?.avatarUrl ?? 
    whoisProfile?.Lens?.avatarUrl ?? 
    whoisProfile?.Farcaster?.avatarUrl ?? 
    whoisProfile?.AlfaFrens?.avatarUrl ?? 
    null;

  const primaryName = addressBookName || torexName || ensName || lensName || farcasterName || alfaFrensName || "";

  return {
    addressChecksummed,
    name: primaryName,
    ensName,
    lensName,
    torexName,
    whoisProfile,
    farcasterName,
    alfaFrensName,
    primaryAvatarUrl,
  };
};

export default useAddressName;
