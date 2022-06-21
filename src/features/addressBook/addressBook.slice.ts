import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { Address } from "@superfluid-finance/sdk-core";
import { getAddress } from "../../utils/memoizedEthersUtils";

export interface AddressBookEntry {
  address: Address;
  name?: string;
}

const adapter = createEntityAdapter<AddressBookEntry>({
  selectId: (x) => getAddress(x.address),
  //   sortComparer: (a, b) => {
  //     if (a.timestampMs > b.timestampMs) {
  //       return -1;
  //     }
  //     if (a.timestampMs < b.timestampMs) {
  //       return 1;
  //     }
  //     return 0;
  //   },
});

export const addressBookSlice = createSlice({
  name: "addressBookEntries",
  initialState: adapter.getInitialState(),
  reducers: {
    addAddressBookEntry: adapter.upsertOne,
  },
});

export const { addAddressBookEntry } = addressBookSlice.actions;

export const addressBookSelectors = adapter.getSelectors();
