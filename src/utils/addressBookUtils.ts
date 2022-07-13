import { AddressBookEntry } from "../features/addressBook/addressBook.slice";
import { getAddress } from "./memoizedEthersUtils";

export function parseOldAddressBookEntries(oldAddressBook: string) {
  const parsedAddressBook: { [chain: string]: AddressBookEntry[] } =
    JSON.parse(oldAddressBook);

  const uniqueAddressMap = Object.values(parsedAddressBook).reduce(
    (allEntries, chainEntries) => ({
      ...allEntries,
      ...chainEntries.reduce(
        (chainAddressesMap, chainEntry) => ({
          ...chainAddressesMap,
          [getAddress(chainEntry.address)]: chainEntry.name || "",
        }),
        {}
      ),
    }),
    {}
  );

  return Object.entries(uniqueAddressMap).map(
    ([address, name]) =>
      ({
        address,
        name,
      } as AddressBookEntry)
  );
}
