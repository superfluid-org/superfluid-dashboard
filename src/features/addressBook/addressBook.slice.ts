import {
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
} from "@reduxjs/toolkit";
import { Address } from "@superfluid-finance/sdk-core";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { RootState } from "../redux/store";

export interface AddressBookEntry {
  address: Address;
  name?: string;
  associatedNetworks?: number[]; // Chain IDs
  isContract?: boolean;
}

export type AddressBookState = EntityState<AddressBookEntry, Address>;

export const adapter = createEntityAdapter<AddressBookEntry, Address>({
  selectId: (x) => getAddress(x.address),
});

export const addressBookSlice = createSlice({
  name: "addressBookEntries",
  initialState: adapter.getInitialState(),
  reducers: {
    addAddressBookEntry: (
      state: EntityState<AddressBookEntry, Address>,
      { payload }: { payload: AddressBookEntry }
    ) =>
      adapter.setAll(state, [
        {
          ...payload,
          address: getAddress(payload.address),
          associatedNetworks: payload.associatedNetworks,
          isContract: payload.isContract,
        },
        ...adapterSelectors.selectAll(state),
      ]),
    addAddressBookEntries: (
      state: EntityState<AddressBookEntry, Address>,
      { payload }: { payload: Array<AddressBookEntry> }
    ) =>
      adapter.addMany(
        state,
        payload.map((newEntry) => ({
          ...newEntry,
          address: getAddress(newEntry.address),
          associatedNetworks: newEntry.associatedNetworks,
          isContract: newEntry.isContract,
        }))
      ),

    removeAddressBookEntries: adapter.removeMany,
    updateAddressBookEntry: adapter.updateOne,
  },
});

export const {
  addAddressBookEntry,
  addAddressBookEntries,
  updateAddressBookEntry,
  removeAddressBookEntries,
} = addressBookSlice.actions;

const selectSelf = (state: RootState): EntityState<AddressBookEntry, Address> =>
  state.addressBook;

const adapterSelectors = adapter.getSelectors();

const searchAddressBookEntries = createSelector(
  [selectSelf, (_items: RootState, search: string) => search],
  (state: EntityState<AddressBookEntry, Address>, search: string): AddressBookEntry[] =>
    adapterSelectors
      .selectAll(state)
      .filter(
        (addressBookEntry) =>
          (addressBookEntry?.name || "")
            .toLowerCase()
            .indexOf(search.toLowerCase()) >= 0 ||
          (addressBookEntry?.address || "")
            .toLowerCase()
            .indexOf(search.toLowerCase()) >= 0
      )
);

const selectByAddresses = createSelector(
  [selectSelf, (_items: RootState, addresses: string[]) => addresses],
  (
    state: EntityState<AddressBookEntry, Address>,
    addresses: string[]
  ): AddressBookEntry[] => {
    const sanitizedAddresses = addresses.map((address) =>
      address.toLowerCase()
    );

    return adapterSelectors
      .selectAll(state)
      .filter((addressBookEntry) =>
        sanitizedAddresses.includes(
          (addressBookEntry?.address || "").toLowerCase()
        )
      );
  }
);

export const addressBookSelectors = {
  ...adapterSelectors,
  searchAddressBookEntries,
  selectByAddresses,
};
