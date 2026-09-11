import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("superfluidWallet config", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is enabled only when env is exactly true", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED", "true");
    const enabled = await import("../../utils/config");
    expect(enabled.default.superfluidWallet.enabled).toBe(true);

    vi.stubEnv("NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED", "false");
    vi.resetModules();
    const disabled = await import("../../utils/config");
    expect(disabled.default.superfluidWallet.enabled).toBe(false);
  });

  it("defaults wallet URL to production", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED", "");
    vi.stubEnv("NEXT_PUBLIC_SUPERFLUID_WALLET_URL", "");
    vi.resetModules();
    const config = await import("../../utils/config");
    expect(config.default.superfluidWallet.url).toBe(
      "https://wallet.superfluid.org"
    );
  });

  it("uses custom wallet URL when set", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPERFLUID_WALLET_URL", "http://localhost:3001");
    vi.resetModules();
    const config = await import("../../utils/config");
    expect(config.default.superfluidWallet.url).toBe("http://localhost:3001");
  });
});
