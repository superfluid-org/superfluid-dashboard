import {
  EIP1193Provider,
  EIP1193RequestFn,
  EIP1474Methods,
  WalletRpcSchema,
  RpcRequestError,
} from 'viem';

import { getHttpRpcClient } from 'viem/utils';
import EventEmitter from 'events';
import appConfig from '../../../utils/config';
import { allNetworks, findNetworkOrThrow } from '../../network/networks';
import { resolvePopupParams } from './resolvePopupParams';
import './superfluidWalletMock.types';

interface ProviderStore {
  accounts: string[];
  organizationId?: string;
  chainId?: number;
}

export const STORAGE_KEY = 'SF:EIP1193Provider:store';

export function clearProviderStore() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function setProviderChainId(chainId: number) {
  updateStore({ chainId });
}

const getStore = (): ProviderStore => {
  if (typeof localStorage === 'undefined') {
    return { accounts: [], organizationId: undefined, chainId: undefined };
  }
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored
    ? JSON.parse(stored)
    : { accounts: [], organizationId: undefined, chainId: undefined };
};

const eventEmitterForStore = new EventEmitter();

const updateStore = (updates: Partial<ProviderStore>) => {
  const currentStore = getStore();
  const newStore = { ...currentStore, ...updates };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStore));
  }

  if (
    updates.accounts &&
    JSON.stringify(updates.accounts) !== JSON.stringify(currentStore.accounts)
  ) {
    eventEmitterForStore.emit('accountsChanged', updates.accounts);
  }
  if (
    updates.chainId !== undefined &&
    updates.chainId !== currentStore.chainId
  ) {
    eventEmitterForStore.emit('chainChanged', `0x${updates.chainId.toString(16)}`);
  }
};

function getStoredChainIdHex(): `0x${string}` | undefined {
  const { chainId } = getStore();
  if (chainId === undefined) return undefined;
  return `0x${chainId.toString(16)}`;
}

const POPUP_METHODS = new Set([
  'eth_requestAccounts',
  'eth_signTransaction',
  'eth_sign',
  'personal_sign',
]);

const WALLET_ORIGIN = new URL(appConfig.superfluidWallet.url).origin;

function getRpcUrlForChain(chainId: number): string {
  const network = findNetworkOrThrow(allNetworks, chainId);
  const rpcUrl = network.rpcUrls.superfluid.http[0];
  if (!rpcUrl) {
    throw new Error(`No Superfluid RPC URL available for chain ${chainId}`);
  }
  return rpcUrl;
}

export function createEIP1193Provider(): EIP1193Provider {
  let popup: Window | null = null;
  const eventEmitter = new EventEmitter();

  eventEmitterForStore.on('accountsChanged', (accounts: string[]) => {
    eventEmitter.emit('accountsChanged', accounts);
  });
  eventEmitterForStore.on('chainChanged', (chain: string) => {
    eventEmitter.emit('chainChanged', chain);
  });

  const requestQueue: Record<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: unknown) => void;
    }
  > = {};

  const handleMessage = (event: MessageEvent) => {
    if (event.origin !== WALLET_ORIGIN || event.source !== popup) return;
    const { method, result, error } = event.data;

    if (method && requestQueue[method]) {
      if (error) {
        requestQueue[method].reject({
          code: error.code,
          message: error.message,
          data: error.data,
        });
      } else {
        if (method === 'eth_requestAccounts') {
          const { accounts, organizationId } = result[0];
          updateStore({ accounts, organizationId });

          requestQueue[method].resolve(accounts);
        } else {
          requestQueue[method].resolve(result);
        }
      }
      delete requestQueue[method];
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('message', handleMessage);
  }

  const PUBLIC_RPC_METHODS = new Set([
    'eth_sendRawTransaction',
    'eth_subscribe',
    'eth_unsubscribe',
    'eth_blobBaseFee',
    'eth_blockNumber',
    'eth_call',
    'eth_coinbase',
    'eth_estimateGas',
    'eth_feeHistory',
    'eth_gasPrice',
    'eth_getBalance',
    'eth_getBlockByHash',
    'eth_getBlockByNumber',
    'eth_getBlockReceipts',
    'eth_getBlockTransactionCountByHash',
    'eth_getBlockTransactionCountByNumber',
    'eth_getCode',
    'eth_getFilterChanges',
    'eth_getFilterLogs',
    'eth_getLogs',
    'eth_getProof',
    'eth_getStorageAt',
    'eth_getTransactionByBlockHashAndIndex',
    'eth_getTransactionByBlockNumberAndIndex',
    'eth_getTransactionByHash',
    'eth_getTransactionCount',
    'eth_getTransactionReceipt',
    'eth_getUncleCountByBlockHash',
    'eth_getUncleCountByBlockNumber',
    'eth_maxPriorityFeePerGas',
    'eth_newBlockFilter',
    'eth_newFilter',
    'eth_newPendingTransactionFilter',
    'eth_syncing',
    'eth_uninstallFilter',
  ]);

  const request: EIP1193RequestFn<EIP1474Methods> = async ({
    method,
    params,
  }) => {
    if (typeof window === 'undefined') {
      throw new Error('Window is not defined');
    }

    if (method === 'eth_sendTransaction') {
      const [transaction] = params as WalletRpcSchema[5]['Parameters'];
      const signedTransaction = (await request({
        method: 'eth_signTransaction',
        params: [transaction],
      } as Parameters<typeof request>[0])) as `0x${string}`;

      return request({
        method: 'eth_sendRawTransaction',
        params: [signedTransaction],
      });
    }

    if (method === 'eth_accounts') {
      return getStore().accounts;
    }

    if (method === 'eth_chainId') {
      const { chainId } = getStore();
      if (chainId === undefined) {
        throw new Error('No chain ID available. Connect a wallet and select a network first.');
      }
      return `0x${chainId.toString(16)}`;
    }

    if (PUBLIC_RPC_METHODS.has(method)) {
      const { chainId } = getStore();
      if (chainId === undefined) {
        throw new Error('No chain ID available for RPC request. Select a network first.');
      }

      const rpcUrl = getRpcUrlForChain(chainId);
      const rpcClient = getHttpRpcClient(rpcUrl);
      const response = await rpcClient.request({
        body: {
          method,
          params,
          id: Math.floor(Math.random() * 1000000),
        },
      });
      if (response.error) {
        throw new RpcRequestError({
          body: { method, params },
          error: response.error,
          url: rpcUrl,
        });
      }

      return response.result;
    }

    if (POPUP_METHODS.has(method)) {
      const mockHandler = window.__SUPERFLUID_WALLET_MOCK_HANDLER__;
      if (mockHandler) {
        const popupParams = await resolvePopupParams(
          method,
          params,
          getStoredChainIdHex(),
          getRpcUrlForChain
        );
        const result = await Promise.resolve(mockHandler(method, popupParams));
        if (method === 'eth_requestAccounts') {
          const { accounts, organizationId } = (
            result as [{ accounts: string[]; organizationId: string }]
          )[0];
          updateStore({ accounts, organizationId });
          return accounts;
        }
        return result;
      }

      if (popup && !popup.closed) {
        popup.close();
        popup = null;
      }
    }

    if (!popup || popup.closed) {
      const width = 360;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const organizationId = getStore().organizationId;
      const orgParam = organizationId ? `&organizationId=${organizationId}` : '';
      const chainIdHex = getStoredChainIdHex();
      const chainParam = chainIdHex ? `&chainId=${encodeURIComponent(chainIdHex)}` : '';
      const walletUrl = appConfig.superfluidWallet.url;
      const popupParams = await resolvePopupParams(
        method,
        params,
        getStoredChainIdHex(),
        getRpcUrlForChain
      );

      popup = window.open(
        `${walletUrl}?request=${encodeURIComponent(JSON.stringify({ method, params: popupParams }))}${orgParam}${chainParam}`,
        'Superfluid Wallet',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error('Popup blocked. Allow popups for this site and try again.');
      }
    }

    return new Promise<unknown>((resolve, reject) => {
      requestQueue[method] = { resolve, reject };

      setTimeout(() => {
        if (requestQueue[method]) {
          delete requestQueue[method];
          if (popup?.closed) {
            reject(new Error('Wallet popup was closed before the request completed.'));
          } else {
            reject(new Error('Wallet request timed out.'));
          }
        }
      }, 60000 * 5);
    });
  };

  return {
    request,
    on: eventEmitter.on.bind(eventEmitter),
    removeListener: eventEmitter.removeListener.bind(eventEmitter),
  };
}
