import { type Connector, createConnector } from 'wagmi';
import {
  createEIP1193Provider,
  clearProviderStore,
  setProviderChainId,
} from './eip1193-provider';
import { getAddress, type Address, type EIP1193Provider } from 'viem';

let accountsChanged: Connector['onAccountsChanged'] | undefined;
let chainChanged: Connector['onChainChanged'] | undefined;
let disconnect: Connector['onDisconnect'] | undefined;

export function superfluidWalletConnector() {
  let provider: EIP1193Provider | null = null;

  return createConnector<EIP1193Provider>((config) => ({
    id: 'superfluidWallet',
    name: 'Superfluid Wallet',
    type: 'superfluidWallet' as const,

    async connect(_params?: { chainId?: number; isReconnecting?: boolean }) {
      if (_params?.chainId) {
        setProviderChainId(_params.chainId);
      }

      const p = (await this.getProvider()) as EIP1193Provider;
      let accounts = _params?.isReconnecting
        ? ((await p.request({ method: 'eth_accounts' })) as Address[])
        : [];
      if (!accounts.length) {
        accounts = (await p.request({ method: 'eth_requestAccounts' })) as Address[];
      }

      if (!accountsChanged) {
        accountsChanged = this.onAccountsChanged.bind(this);
        p.on('accountsChanged', accountsChanged);
      }
      if (!chainChanged) {
        chainChanged = this.onChainChanged.bind(this);
        p.on('chainChanged', chainChanged);
      }
      if (!disconnect) {
        disconnect = this.onDisconnect.bind(this);
        p.on('disconnect', disconnect);
      }

      const chainId = Number(await p.request({ method: 'eth_chainId' }));
      return { accounts, chainId } as never;
    },

    async getProvider(): Promise<EIP1193Provider> {
      if (!provider) provider = createEIP1193Provider();
      return provider;
    },

    async disconnect() {
      const p = (await this.getProvider()) as EIP1193Provider;
      if (accountsChanged) {
        p.removeListener('accountsChanged', accountsChanged);
        accountsChanged = undefined;
      }
      if (chainChanged) {
        p.removeListener('chainChanged', chainChanged);
        chainChanged = undefined;
      }
      if (disconnect) {
        p.removeListener('disconnect', disconnect);
        disconnect = undefined;
      }
      clearProviderStore();
    },

    async getAccounts(): Promise<readonly Address[]> {
      const p = (await this.getProvider()) as EIP1193Provider;
      return (await p.request({ method: 'eth_accounts' })) as Address[];
    },

    async getChainId() {
      const p = (await this.getProvider()) as EIP1193Provider;
      return Number(await p.request({ method: 'eth_chainId' }));
    },

    async isAuthorized() {
      try {
        return (await this.getAccounts()).length > 0;
      } catch {
        return false;
      }
    },

    onAccountsChanged(accounts) {
      if (accounts.length === 0) this.onDisconnect();
      else config.emitter.emit('change', { accounts: accounts.map((x) => getAddress(x)) });
    },

    onChainChanged(chain) {
      const chainId = Number(chain);
      setProviderChainId(chainId);
      config.emitter.emit('change', { chainId });
    },

    async onDisconnect() {
      config.emitter.emit('disconnect');
      clearProviderStore();
      const p = (await this.getProvider()) as EIP1193Provider;
      if (accountsChanged) {
        p.removeListener('accountsChanged', accountsChanged);
        accountsChanged = undefined;
      }
      if (chainChanged) {
        p.removeListener('chainChanged', chainChanged);
        chainChanged = undefined;
      }
      if (disconnect) {
        p.removeListener('disconnect', disconnect);
        disconnect = undefined;
      }
    },
  }));
}

export const SUPERFLUID_WALLET_CONNECTOR_ID = 'superfluidWallet';
