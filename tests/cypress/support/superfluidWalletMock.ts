import { privateKeyToAccount } from 'viem/accounts';
import { hexToBigInt, type Hex } from 'viem';

const STORAGE_KEY = 'SF:EIP1193Provider:store';

export type SuperfluidWalletMockOptions = {
  privateKey: `0x${string}`;
  chainId: number;
};

type RpcTransaction = Record<string, Hex | undefined>;

/**
 * Installs an in-process Superfluid Wallet mock (no popup / Turnkey).
 * Requires dashboard dev server with NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED=true.
 */
export function installSuperfluidWalletMock(
  win: Window & typeof globalThis,
  options: SuperfluidWalletMockOptions
) {
  const account = privateKeyToAccount(options.privateKey);

  win.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      accounts: [],
      organizationId: undefined,
      chainId: options.chainId,
    })
  );

  win.__SUPERFLUID_WALLET_MOCK_HANDLER__ = async (method: string, params: unknown) => {
    if (method === 'eth_requestAccounts') {
      return [
        {
          accounts: [account.address],
          organizationId: 'cypress-mock-org',
        },
      ];
    }

    if (method === 'eth_signTransaction') {
      const [tx] = params as [RpcTransaction];
      const chainId = tx.chainId
        ? Number(hexToBigInt(tx.chainId))
        : options.chainId;
      const gasField = tx.gas ?? tx.gasLimit;
      if (!gasField) {
        throw new Error('Cypress mock wallet: transaction missing gas/gasLimit');
      }

      return account.signTransaction({
        type: 'eip1559',
        chainId,
        to: tx.to as `0x${string}`,
        gas: hexToBigInt(gasField),
        maxFeePerGas: hexToBigInt(tx.maxFeePerGas!),
        maxPriorityFeePerGas: hexToBigInt(tx.maxPriorityFeePerGas!),
        nonce: Number(hexToBigInt(tx.nonce!)),
        value: tx.value ? hexToBigInt(tx.value) : BigInt(0),
        data: tx.data,
      });
    }

    throw new Error(`Cypress mock wallet: unsupported method ${method}`);
  };
}

declare global {
  interface Window {
    __SUPERFLUID_WALLET_MOCK_HANDLER__?: (
      method: string,
      params: unknown
    ) => Promise<unknown> | unknown;
  }
}

export {};
