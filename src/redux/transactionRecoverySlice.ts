import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { TransactionInfo } from '@superfluid-finance/sdk-redux';
import { TokenUpgradeDowngradePair } from './endpoints/adHocSubgraphEndpoints';

type TransactionRecovery<T> = {
  transactionInfo: TransactionInfo;
  data: T;
};

const createRecoveryAdapter = <T>() =>
  createEntityAdapter<TransactionRecovery<T>>({
    selectId: (transactionRecovery) => transactionRecovery.transactionInfo.hash,
    sortComparer: (a, b) =>
      a.transactionInfo.hash.localeCompare(b.transactionInfo.hash),
  });

export const superTokenUpgradedAdapter = createRecoveryAdapter<{
  tokenUpgrade: TokenUpgradeDowngradePair;
  amountWei: string;
}>();

export const superTokenDowngradedAdapter = createRecoveryAdapter<{
  tokenUpgrade: TokenUpgradeDowngradePair;
  amountWei: string;
}>();

const transactionRecoverySlice = createSlice({
  name: 'transactionRecovery',
  initialState: {
    ...superTokenUpgradedAdapter.getInitialState(),
    ...superTokenDowngradedAdapter.getInitialState(),
  },
  reducers: {
    superTokenUpgraded: superTokenUpgradedAdapter.addOne,
    superTokenDowngraded: superTokenDowngradedAdapter.addOne,
  },
});

export const { superTokenUpgraded, superTokenDowngraded } =
  transactionRecoverySlice.actions;

export default transactionRecoverySlice.reducer;
