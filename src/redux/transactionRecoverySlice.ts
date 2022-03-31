import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { TransactionInfo } from '@superfluid-finance/sdk-redux';
import { TokenUpgradeDowngradePair } from './endpoints/adHocSubgraphEndpoints';

interface TransactionRecovery<T> {
  key: string;
  transactionInfo: TransactionInfo;
  data: T;
};

interface SuperTokenDowngradeRecovery extends TransactionRecovery<{
  tokenUpgrade: TokenUpgradeDowngradePair;
  amountWei: string;
}> {
  key: "SUPER_TOKEN_DOWNGRADE";
}

interface SuperTokenUpgradeRecovery extends TransactionRecovery<{
  tokenUpgrade: TokenUpgradeDowngradePair;
  amountWei: string;
}> {
  key: "SUPER_TOKEN_UPGRADE";
}

export type TransactionRecoveries = SuperTokenDowngradeRecovery | SuperTokenUpgradeRecovery;

// const createRecoveryAdapter = <T>() =>
//   createEntityAdapter<TransactionRecovery<T>>({
//     selectId: (transactionRecovery) => transactionRecovery.transactionInfo.hash,
//     sortComparer: (a, b) =>
//       a.transactionInfo.hash.localeCompare(b.transactionInfo.hash),
//   });

// export const superTokenUpgradedAdapter = createRecoveryAdapter<{
//   tokenUpgrade: TokenUpgradeDowngradePair;
//   amountWei: string;
// }>();

// export const superTokenDowngradedAdapter = createRecoveryAdapter<{
//   tokenUpgrade: TokenUpgradeDowngradePair;
//   amountWei: string;
// }>();

const transactionRecoveryAdapter = createEntityAdapter<TransactionRecoveries>({
  selectId: (transactionRecovery) => transactionRecovery.transactionInfo.hash,
  sortComparer: (a, b) =>
    a.transactionInfo.hash.localeCompare(b.transactionInfo.hash),
});

const transactionRecoverySlice = createSlice({
  name: 'transactionRecovery',
  initialState: transactionRecoveryAdapter.getInitialState(),
  reducers: {
    addTransactionRecovery: transactionRecoveryAdapter.addOne
  },
});

export const transactionRecoverySelectors = transactionRecoveryAdapter.getSelectors();

export const { addTransactionRecovery } =
  transactionRecoverySlice.actions;

export default transactionRecoverySlice.reducer;
