/** Cypress / test-only mock for popup wallet RPC (see tests/cypress/support/superfluidWalletMock.ts). */
export type SuperfluidWalletMockHandler = (
  method: string,
  params: unknown
) => Promise<unknown> | unknown;

declare global {
  interface Window {
    __SUPERFLUID_WALLET_MOCK_HANDLER__?: SuperfluidWalletMockHandler;
  }
}

export {};
