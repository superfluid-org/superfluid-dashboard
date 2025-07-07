import { addressBookSelectors } from "../features/addressBook/addressBook.slice";
import sanitizeAddressBookName from "../features/addressBook/sanitizeAddressBookName";
import { whoisApi, SuperfluidProfile } from "../features/whois/whoisApi.slice";
import { useAppSelector } from "../features/redux/store";
import { getAddress } from "../utils/memoizedEthersUtils";

export interface AddressNameResult {
  addressChecksummed: string;
  name: string | "";
  ensName?: string;
  lensName?: string;
  farcasterName?: string;
  alfaFrensName?: string;
  torexName?: string;
  whoisProfile?: SuperfluidProfile | null;
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

  const whoisProfile = whoisQuery.data;
  const ensName = whoisProfile?.ENS?.handle;
  const lensName = whoisProfile?.Lens?.handle?.replace("lens/", "");
  const farcasterName = whoisProfile?.Farcaster?.handle;
  const alfaFrensName = whoisProfile?.AlfaFrens?.handle;
  const torexName = whoisProfile?.TOREX?.handle;

  const primaryAvatarUrl = whoisProfile?.recommendedAvatar ?? null;

  const primaryName = addressBookName || whoisProfile?.recommendedName || "";

  return {
    addressChecksummed,
    name: primaryName,
    ensName,
    lensName,
    farcasterName,
    alfaFrensName,
    torexName,
    whoisProfile,
    primaryAvatarUrl,
  };
};

export default useAddressName;
