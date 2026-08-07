import { useCallback, useEffect, useMemo, useState } from "react";
import { platformApi } from "../redux/platformApi/platformApi";
import {
  ERC20TransferHistoryCursor,
  ERC20TransferHistoryItem,
} from "./erc20TransferHistory";

interface TransferHistoryState {
  key: string;
  transfers: ERC20TransferHistoryItem[];
  requestCursor?: ERC20TransferHistoryCursor;
  nextCursor?: ERC20TransferHistoryCursor;
  hasMore: boolean;
  pagesLoaded: number;
}

const createInitialState = (key: string): TransferHistoryState => ({
  key,
  transfers: [],
  hasMore: false,
  pagesLoaded: 0,
});

const useERC20TransferHistory = ({
  address,
  tokenAddress,
  chainId,
}: {
  address: string;
  tokenAddress: string;
  chainId: number;
}) => {
  const historyKey = `${chainId}-${address.toLowerCase()}-${tokenAddress.toLowerCase()}`;
  const [state, setState] = useState<TransferHistoryState>(() =>
    createInitialState(historyKey)
  );
  const currentState =
    state.key === historyKey ? state : createInitialState(historyKey);

  const historyQuery = platformApi.useErc20TransferHistoryQuery({
    address,
    tokenAddress,
    chainId,
    ...(currentState.requestCursor
      ? { cursor: currentState.requestCursor }
      : {}),
  });

  useEffect(() => {
    const response = historyQuery.currentData;
    if (!response) return;

    setState((current) => {
      const base =
        current.key === historyKey ? current : createInitialState(historyKey);
      const transfersById = new Map(
        base.transfers.map((transfer) => [transfer.id, transfer])
      );
      response.transfers.forEach((transfer) =>
        transfersById.set(transfer.id, transfer)
      );

      return {
        ...base,
        transfers: [...transfersById.values()].sort(
          (first, second) =>
            Date.parse(second.timestamp) - Date.parse(first.timestamp)
        ),
        nextCursor: response.cursor,
        hasMore: response.hasMore,
        pagesLoaded: base.pagesLoaded + 1,
      };
    });
  }, [historyKey, historyQuery.currentData]);

  const loadMore = useCallback(() => {
    setState((current) => {
      const base =
        current.key === historyKey ? current : createInitialState(historyKey);
      if (
        !base.hasMore ||
        !base.nextCursor ||
        base.requestCursor === base.nextCursor
      ) {
        return base;
      }

      return { ...base, requestCursor: base.nextCursor };
    });
  }, [historyKey]);

  return useMemo(
    () => ({
      transfers: currentState.transfers,
      hasMore: currentState.hasMore,
      nextCursor: currentState.nextCursor,
      pagesLoaded: currentState.pagesLoaded,
      loadMore,
      isLoading: historyQuery.isLoading && currentState.transfers.length === 0,
      isFetching: historyQuery.isFetching,
      isError: historyQuery.isError,
    }),
    [
      currentState.hasMore,
      currentState.nextCursor,
      currentState.pagesLoaded,
      currentState.transfers,
      historyQuery.isError,
      historyQuery.isFetching,
      historyQuery.isLoading,
      loadMore,
    ]
  );
};

export default useERC20TransferHistory;
