import { createConfig, type CreateConnectorFn } from "@wagmi/core";
import {
  DEFAULT_STORAGE_KEY,
  superfluidWallet,
} from "@d10r/wagmi-superfluid-wallet";
import { custom, type EIP1193Provider } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia, optimismSepolia } from "viem/chains";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const TEST_PRIVATE_KEY =
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80" as const;
const TEST_CHAIN_ID = optimismSepolia.id;
const FAKE_TX_HASH =
  "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef";

const mockRpcTransport = custom({
  async request({ method }) {
    switch (method) {
      case "eth_chainId":
        return `0x${baseSepolia.id.toString(16)}`;
      case "eth_getTransactionCount":
        return "0x1";
      case "eth_gasPrice":
      case "eth_maxPriorityFeePerGas":
        return "0x59682f00";
      case "eth_estimateGas":
        return "0x5208";
      case "eth_blockNumber":
        return "0x1";
      case "eth_getBlockByNumber":
        return { baseFeePerGas: "0x1", number: "0x1" };
      case "eth_feeHistory":
        return {
          oldestBlock: "0x1",
          baseFeePerGas: ["0x1", "0x1"],
          gasUsedRatio: [0.5],
          reward: [["0x1"]],
        };
      case "eth_sendRawTransaction":
        return FAKE_TX_HASH;
      default:
        throw new Error(`mock rpc: unsupported method ${method}`);
    }
  },
});

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
      if (method === "eth_sendTransaction") {
        return FAKE_TX_HASH;
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
      chains: [optimismSepolia, baseSepolia],
      transports: {
        [optimismSepolia.id]: mockRpcTransport,
        [baseSepolia.id]: mockRpcTransport,
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
    const config = createDashboardStyleConfig();
    const connector = config.connectors[0];
    await connector.connect({ chainId: optimismSepolia.id });

    await connector.switchChain?.({ chainId: baseSepolia.id });

    expect(await connector.getChainId()).toBe(baseSepolia.id);
    expect(readStoredState()?.chainId).toBe(baseSepolia.id);

    type MockHandler = (method: string, params: unknown) => Promise<unknown>;
    const win = window as Window & { __SUPERFLUID_WALLET_MOCK_HANDLER__?: MockHandler };
    const original = win.__SUPERFLUID_WALLET_MOCK_HANDLER__!;
    let captured: { method: string; params: unknown } | undefined;
    win.__SUPERFLUID_WALLET_MOCK_HANDLER__ = async (method, params) => {
      captured = { method, params };
      return original(method, params);
    };

    const account = privateKeyToAccount(TEST_PRIVATE_KEY);
    const provider = (await connector.getProvider()) as EIP1193Provider;
    await provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: account.address,
          to: account.address,
          value: "0x0",
          data: "0x",
        },
      ],
    });

    expect(["eth_sendTransaction", "eth_signTransaction"]).toContain(
      captured?.method
    );
    const tx = (captured?.params as [{ chainId?: string | number }])[0];
    const numericChainId =
      typeof tx.chainId === "string" && tx.chainId.startsWith("0x")
        ? Number.parseInt(tx.chainId, 16)
        : Number(tx.chainId);
    expect(numericChainId).toBe(baseSepolia.id);
  });
});
