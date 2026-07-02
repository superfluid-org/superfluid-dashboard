import { createConfig, http, type CreateConnectorFn } from "@wagmi/core";
import {
  DEFAULT_STORAGE_KEY,
  superfluidWallet,
} from "@d10r/wagmi-superfluid-wallet";
import { privateKeyToAccount } from "viem/accounts";
import { optimismSepolia } from "viem/chains";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TEST_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const;
const TEST_CHAIN_ID = optimismSepolia.id;

function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

function readStoredState() {
  const raw = localStorage.getItem(DEFAULT_STORAGE_KEY);
  return raw
    ? (JSON.parse(raw) as { accounts: string[]; chainId: number })
    : null;
}

function setupBrowserMocks() {
  const localStorageMock = createLocalStorageMock();
  const account = privateKeyToAccount(TEST_PRIVATE_KEY);
  const popup = { closed: false };
  const openMock = vi.fn(() => popup);
  const messageListeners = new Map<string, Set<EventListener>>();

  const windowStub = {
    localStorage: localStorageMock,
    open: openMock,
    location: { origin: "http://localhost:3000" },
    screenX: 0,
    screenY: 0,
    outerWidth: 1200,
    outerHeight: 800,
    addEventListener: (type: string, listener: EventListener) => {
      if (!messageListeners.has(type)) messageListeners.set(type, new Set());
      messageListeners.get(type)!.add(listener);
    },
    removeEventListener: (type: string, listener: EventListener) => {
      messageListeners.get(type)?.delete(listener);
    },
    dispatchEvent: (event: Event) => {
      for (const listener of messageListeners.get(event.type) ?? []) {
        listener(event);
      }
      return true;
    },
    __SUPERFLUID_WALLET_MOCK_HANDLER__: async (
      method: string,
      params: unknown
    ) => {
      if (method === "eth_requestAccounts") {
        return [{ accounts: [account.address], organizationId: "test-org" }];
      }
      if (method === "eth_signTransaction") {
        const [tx] = params as [{ to: string; data?: string }];
        return account.signTransaction({
          chainId: TEST_CHAIN_ID,
          type: "eip1559",
          to: tx.to as `0x${string}`,
          data: tx.data as `0x${string}` | undefined,
        });
      }
      throw new Error(`mock wallet: unsupported method ${method}`);
    },
  };

  vi.stubGlobal("window", windowStub);
  vi.stubGlobal("localStorage", localStorageMock);

  return { openMock, localStorageMock };
}

describe("Dashboard superfluid wallet integration", () => {
  beforeEach(() => {
    vi.resetModules();
    setupBrowserMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createDashboardStyleConfig() {
    const walletUrl = "http://localhost:3001";
    const sf = superfluidWallet({ walletUrl });
    return createConfig({
      chains: [optimismSepolia],
      transports: {
        [optimismSepolia.id]: http("https://sepolia.optimism.io"),
      },
      connectors: [sf.connector() as CreateConnectorFn],
      multiInjectedProviderDiscovery: false,
    });
  }

  it("connects via the published package connector", async () => {
    const config = createDashboardStyleConfig();
    const connector = config.connectors[0];

    const result = await connector.connect({ chainId: optimismSepolia.id });

    expect(result.accounts).toHaveLength(1);
    expect(result.chainId).toBe(optimismSepolia.id);
    expect(readStoredState()?.chainId).toBe(optimismSepolia.id);
  });

  it("switchChain keeps provider store in sync", async () => {
    const walletUrl = "http://localhost:3001";
    const sf = superfluidWallet({ walletUrl });
    const config = createConfig({
      chains: [optimismSepolia],
      transports: {
        [optimismSepolia.id]: http("https://sepolia.optimism.io"),
      },
      connectors: [sf.connector() as CreateConnectorFn],
      multiInjectedProviderDiscovery: false,
    });
    const connector = config.connectors[0];
    await connector.connect({ chainId: optimismSepolia.id });

    await connector.switchChain?.({ chainId: optimismSepolia.id });

    expect(await connector.getChainId()).toBe(optimismSepolia.id);
    expect(readStoredState()?.chainId).toBe(optimismSepolia.id);
  });
});
