import { afterEach, describe, expect, it, vi } from "vitest";
import { getSafeMessage, isSafeMessageLookupSupported } from "./safeMessageLookup";

const HASH = `0x${"a".repeat(64)}`;

const mockFetch = (impl: typeof fetch) => {
  vi.stubGlobal("fetch", vi.fn(impl));
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isSafeMessageLookupSupported", () => {
  /**
   * The chains the provider advertises for `safeMessageV1`. Kept as an explicit list because a
   * missing short name silently degrades every rejection on that chain to the ambiguity UI —
   * a quiet loss of the auto-cancel, not a visible failure.
   */
  it.each([1, 10, 56, 100, 137, 8453, 42161, 42220, 43114, 84532, 534352, 11155111])(
    "maps chain %i",
    (chainId: number) => {
      expect(isSafeMessageLookupSupported(chainId)).toBe(true);
    }
  );

  it("does not map a chain the provider only supports for plain signatures", () => {
    // Optimism Sepolia is signature-only, so a Safe never reaches a lookup there.
    expect(isSafeMessageLookupSupported(11155420)).toBe(false);
  });
});

describe("getSafeMessage", () => {
  it("reports a proposal and its confirmation count", async () => {
    mockFetch(async () =>
      new Response(JSON.stringify({ confirmations: [{}, {}] }), { status: 200 })
    );
    await expect(getSafeMessage(1, HASH)).resolves.toEqual({
      status: "found",
      confirmations: 2,
    });
  });

  it("treats a 404 as a positive absence", async () => {
    mockFetch(async () =>
      new Response(JSON.stringify({ detail: "No SafeMessage matches the given query." }), {
        status: 404,
      })
    );
    await expect(getSafeMessage(1, HASH)).resolves.toEqual({ status: "absent" });
  });

  it("is unavailable, never absent, when the service refuses us", async () => {
    // A tightened anonymous-access policy must never read as "the user declined".
    mockFetch(async () => new Response("", { status: 403 }));
    const result = await getSafeMessage(1, HASH);
    expect(result.status).toBe("unavailable");
  });

  it("is unavailable when rate limited", async () => {
    mockFetch(async () => new Response("", { status: 429 }));
    expect((await getSafeMessage(1, HASH)).status).toBe("unavailable");
  });

  it("is unavailable, and does not throw, when the network fails", async () => {
    mockFetch(async () => {
      throw new Error("network down");
    });
    const result = await getSafeMessage(1, HASH);
    expect(result.status).toBe("unavailable");
  });

  it("is unavailable when the body is not the shape we expect", async () => {
    mockFetch(async () => new Response(JSON.stringify({ nope: true }), { status: 200 }));
    expect((await getSafeMessage(1, HASH)).status).toBe("unavailable");
  });

  it("is unavailable on an unmapped chain without issuing a request", async () => {
    const fetchSpy = vi.fn(async () => new Response("", { status: 200 }));
    vi.stubGlobal("fetch", fetchSpy);
    expect((await getSafeMessage(999999, HASH)).status).toBe("unavailable");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("requests the short-name tx-service route for the chain", async () => {
    const fetchSpy = vi.fn(
      async (_input: RequestInfo | URL, _init?: RequestInit) =>
        new Response(JSON.stringify({ confirmations: [] }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchSpy);
    await getSafeMessage(100, HASH);
    expect(String(fetchSpy.mock.calls[0]?.[0])).toBe(
      `https://api.safe.global/tx-service/gno/api/v1/messages/${HASH}/`
    );
  });
});
