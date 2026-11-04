import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Address, Hex } from "viem";
import type { SafeSigningOutcome } from "./safeAuthorization";
import type { SafeMessageLookupResult } from "./safeMessageLookup";

vi.mock("@sentry/react", () => ({ captureException: vi.fn() }));
vi.mock("./safeAuthorization", () => ({
  createSafeAppsSdk: vi.fn(() => ({})),
  readSafeAuthorizationContext: vi.fn(async () => ({ threshold: 2 })),
  requestOffChainSigning: vi.fn(async () => {}),
  deriveSafeMessageHash: vi.fn(async () => SAFE_MESSAGE_HASH),
  watchSafeSigning: vi.fn(),
}));
vi.mock("./relayApi", () => ({
  createRelayExecution: vi.fn(),
  cancelRelayExecution: vi.fn(),
}));
vi.mock("./safeMessageLookup", () => ({ getSafeMessage: vi.fn() }));

import { runSafeAuthorization } from "./executeSafeAuthorization";
import { watchSafeSigning } from "./safeAuthorization";
import { cancelRelayExecution, createRelayExecution } from "./relayApi";
import { getSafeMessage } from "./safeMessageLookup";

const SAFE_MESSAGE_HASH = `0x${"b".repeat(64)}` as Hex;
const SIGNER = `0x${"1".repeat(40)}` as Address;

const callbacks = () => ({
  onIntentCreated: vi.fn(),
  onExecutionCreated: vi.fn(),
  onCancelRequested: vi.fn(),
  onCancelConfirmed: vi.fn(),
  onSigningFailed: vi.fn(),
});

const args = (cb: ReturnType<typeof callbacks>) => ({
  chainId: 11155111,
  signerAddress: SIGNER,
  macroAddress: SIGNER,
  encodedPayload: "0x" as Hex,
  typedData: {} as never,
  innerDigest: "0x" as Hex,
  validityWindowInSeconds: 3600,
  callbacks: cb,
});

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
};

const execution = {
  id: "exec-1",
  validity: { validBefore: "9999999999" },
};

beforeEach(() => {
  vi.mocked(createRelayExecution).mockReset();
  vi.mocked(cancelRelayExecution).mockReset();
  vi.mocked(getSafeMessage).mockReset();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("runSafeAuthorization", () => {
  it("still requests cancellation when the create POST fails before signing settles", async () => {
    const signing = deferred<SafeSigningOutcome>();
    vi.mocked(watchSafeSigning).mockReturnValue(signing.promise);
    vi.mocked(createRelayExecution).mockRejectedValue(new Error("timeout"));
    const cb = callbacks();

    await expect(runSafeAuthorization(args(cb))).rejects.toThrow("timeout");
    const { clientRequestId } = cb.onIntentCreated.mock.calls[0][0];

    signing.resolve({ kind: "on-chain", safeTxHash: "0x01" as Hex });
    await vi.waitFor(() => expect(cb.onSigningFailed).toHaveBeenCalled());

    // No id to cancel yet: the durable flag is what the pre-POST replay acts on.
    expect(cb.onCancelRequested).toHaveBeenCalledWith({
      clientRequestId,
      executionId: undefined,
    });
    expect(cancelRelayExecution).not.toHaveBeenCalled();
    expect(cb.onSigningFailed).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "on-chain-signing", cancelConfirmed: false })
    );
  });

  it("does not treat a final 404 after unavailable answers as a decline", async () => {
    vi.useFakeTimers();
    vi.mocked(watchSafeSigning).mockResolvedValue({
      kind: "rejected",
      error: new Error("Transaction was rejected"),
    });
    vi.mocked(createRelayExecution).mockResolvedValue(execution as never);
    const unavailable: SafeMessageLookupResult = {
      status: "unavailable",
      reason: "rate limited",
    };
    vi.mocked(getSafeMessage)
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValueOnce(unavailable)
      .mockResolvedValue({ status: "absent" });
    const cb = callbacks();

    const result = await runSafeAuthorization(args(cb));
    await vi.advanceTimersByTimeAsync(40_000);
    await result.signingSettled;

    expect(getSafeMessage).toHaveBeenCalledTimes(7);
    expect(cb.onCancelRequested).not.toHaveBeenCalled();
    expect(cancelRelayExecution).not.toHaveBeenCalled();
    expect(cb.onSigningFailed).not.toHaveBeenCalled();
  });

  it("cancels on an absence sustained across the whole probe window", async () => {
    vi.useFakeTimers();
    vi.mocked(watchSafeSigning).mockResolvedValue({
      kind: "rejected",
      error: new Error("Transaction was rejected"),
    });
    vi.mocked(createRelayExecution).mockResolvedValue(execution as never);
    vi.mocked(cancelRelayExecution).mockResolvedValue(execution as never);
    vi.mocked(getSafeMessage).mockResolvedValue({ status: "absent" });
    const cb = callbacks();

    const result = await runSafeAuthorization(args(cb));
    await vi.advanceTimersByTimeAsync(40_000);
    await result.signingSettled;

    expect(cancelRelayExecution).toHaveBeenCalledWith("exec-1");
    expect(cb.onSigningFailed).toHaveBeenCalledWith(
      expect.objectContaining({ reason: "declined", cancelConfirmed: true })
    );
  });
});
