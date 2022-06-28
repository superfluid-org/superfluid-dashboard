import {
  createDraftSafeSelector,
  createEntityAdapter,
  createSlice,
  EntityState,
} from "@reduxjs/toolkit";
import { Address } from "@superfluid-finance/sdk-core";
import { getAddress } from "../../utils/memoizedEthersUtils";
import { AppStore, RootState } from "../redux/store";

export interface AddressBookEntry {
  address: Address;
  name?: string;
}

const adapter = createEntityAdapter<AddressBookEntry>({
  selectId: (x) => getAddress(x.address),
});

export const addressBookSlice = createSlice({
  name: "addressBookEntries",
  initialState: adapter.getInitialState(),
  reducers: {
    addAddressBookEntry: (
      state: EntityState<AddressBookEntry>,
      { payload }: { payload: AddressBookEntry }
    ) =>
      adapter.upsertOne(state, {
        ...payload,
        address: getAddress(payload.address),
      }),

    addAddressBookEntries: (
      state: EntityState<AddressBookEntry>,
      { payload }: { payload: Array<AddressBookEntry> }
    ) =>
      adapter.upsertMany(
        state,
        payload.map((newEntry) => ({
          ...newEntry,
          address: getAddress(newEntry.address),
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

/**
 * Custom selectors
 */

const selectSelf = (state: RootState) => state.addressBook;

const adapterSelectors = adapter.getSelectors();

const searchAddressBookEntries = (search: string, state: RootState) => {
  return adapterSelectors
    .selectAll(selectSelf(state))
    .filter(
      (addressBookEntry) =>
        (addressBookEntry?.name || "")
          .toLowerCase()
          .indexOf(search.toLowerCase()) >= 0 ||
        (addressBookEntry?.address || "")
          .toLowerCase()
          .indexOf(search.toLowerCase()) >= 0
    );
};

export const addressBookSelectors = {
  ...adapter.getSelectors(),
  searchAddressBookEntries,
};
