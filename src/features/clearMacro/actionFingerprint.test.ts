import { describe, expect, it } from "vitest";
import type { Address } from "viem";
import { actionFingerprint, isBlockedByGuards } from "./actionFingerprint";
import type { ClearMacroAction } from "./dashboardClearMacro";

const TOKEN = "0xAAaAaAaaAaAaAaaAaAAAAAAAAaaaAaAaAaaAaaAa" as Address;
const ALICE = "0xBBbBbBBbBbbBbbBbbbbbBBBBbBbbbBbBbBbbBBbB" as Address;
const BOB = "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC" as Address;

const SIGNER = "0xDddDDDddDDDddDDDdDDdDDdDDdDdDdDDdDDDdDDD";

describe("actionFingerprint", () => {
  it("distinguishes two transfers that differ only in recipient", () => {
    const toAlice: ClearMacroAction = {
      kind: "transfer",
      superToken: TOKEN,
      receiver: ALICE,
      amount: 1n,
    };
    const toBob: ClearMacroAction = { ...toAlice, receiver: BOB };
    expect(actionFingerprint(toAlice)).not.toBe(actionFingerprint(toBob));
  });

  it("distinguishes two transfers that differ only in amount", () => {
    const base: ClearMacroAction = {
      kind: "transfer",
      superToken: TOKEN,
      receiver: ALICE,
      amount: 1n,
    };
    expect(actionFingerprint(base)).not.toBe(
      actionFingerprint({ ...base, amount: 2n })
    );
  });

  it("distinguishes two transfers that differ only in token", () => {
    const base: ClearMacroAction = {
      kind: "transfer",
      superToken: TOKEN,
      receiver: ALICE,
      amount: 1n,
    };
    expect(actionFingerprint(base)).not.toBe(
      actionFingerprint({ ...base, superToken: BOB })
    );
  });

  it("is stable across address casing", () => {
    const base: ClearMacroAction = {
      kind: "transfer",
      superToken: TOKEN,
      receiver: ALICE,
      amount: 1n,
    };
    expect(
      actionFingerprint({
        ...base,
        superToken: TOKEN.toLowerCase() as Address,
        receiver: ALICE.toUpperCase().replace("0X", "0x") as Address,
      })
    ).toBe(actionFingerprint(base));
  });

  it("does not confuse upgrade with downgrade of the same amount", () => {
    const upgrade: ClearMacroAction = {
      kind: "upgrade",
      superToken: TOKEN,
      amount: 5n,
    };
    const downgrade: ClearMacroAction = { ...upgrade, kind: "downgrade" };
    expect(actionFingerprint(upgrade)).not.toBe(actionFingerprint(downgrade));
  });

  it("does not confuse createFlow with updateFlow at the same rate", () => {
    const create: ClearMacroAction = {
      kind: "createFlow",
      superToken: TOKEN,
      receiver: ALICE,
      flowRate: 100n,
    };
    const update: ClearMacroAction = { ...create, kind: "updateFlow" };
    expect(actionFingerprint(create)).not.toBe(actionFingerprint(update));
  });

  it("gives every action kind a distinct fingerprint", () => {
    const actions: ClearMacroAction[] = [
      { kind: "approve", superToken: TOKEN, spender: ALICE, amount: 1n },
      { kind: "transfer", superToken: TOKEN, receiver: ALICE, amount: 1n },
      { kind: "upgrade", superToken: TOKEN, amount: 1n },
      { kind: "downgrade", superToken: TOKEN, amount: 1n },
      { kind: "createFlow", superToken: TOKEN, receiver: ALICE, flowRate: 1n },
      { kind: "updateFlow", superToken: TOKEN, receiver: ALICE, flowRate: 1n },
      { kind: "deleteFlow", superToken: TOKEN, sender: ALICE, receiver: BOB },
      {
        kind: "scheduleFlow",
        superToken: TOKEN,
        receiver: ALICE,
        startDate: 1,
        flowRate: 1n,
        endDate: 2,
      },
      { kind: "deleteFlowSchedule", superToken: TOKEN, receiver: ALICE },
    ];
    const fingerprints = actions.map(actionFingerprint);
    expect(new Set(fingerprints).size).toBe(actions.length);
  });

  it("distinguishes schedules that differ only in end date", () => {
    const base: ClearMacroAction = {
      kind: "scheduleFlow",
      superToken: TOKEN,
      receiver: ALICE,
      startDate: 1,
      flowRate: 1n,
      endDate: 2,
    };
    expect(actionFingerprint(base)).not.toBe(
      actionFingerprint({ ...base, endDate: 3 })
    );
  });
});

describe("isBlockedByGuards", () => {
  const guard = {
    chainId: 137,
    signerAddress: SIGNER,
    actionFingerprint: "transfer|token|alice|1",
  };

  it("Guard A blocks any gasless request for the same signer and chain", () => {
    expect(
      isBlockedByGuards([guard], { chainId: 137, signerAddress: SIGNER }, "A")
    ).toBe(true);
  });

  it("Guard A ignores a different chain or a different signer", () => {
    expect(
      isBlockedByGuards([guard], { chainId: 1, signerAddress: SIGNER }, "A")
    ).toBe(false);
    expect(
      isBlockedByGuards([guard], { chainId: 137, signerAddress: BOB }, "A")
    ).toBe(false);
  });

  it("Guard A matches regardless of signer address casing", () => {
    expect(
      isBlockedByGuards(
        [guard],
        { chainId: 137, signerAddress: SIGNER.toUpperCase() },
        "A"
      )
    ).toBe(true);
  });

  it("Guard B blocks only the matching action", () => {
    expect(
      isBlockedByGuards(
        [guard],
        {
          chainId: 137,
          signerAddress: SIGNER,
          actionFingerprint: "transfer|token|alice|1",
        },
        "B"
      )
    ).toBe(true);
    expect(
      isBlockedByGuards(
        [guard],
        {
          chainId: 137,
          signerAddress: SIGNER,
          actionFingerprint: "transfer|token|bob|1",
        },
        "B"
      )
    ).toBe(false);
  });

  it("Guard B does not block when either side is unidentifiable", () => {
    // An unidentifiable action is not evidence of a match — over-blocking every direct write
    // whenever any gasless intent exists would be its own defect.
    expect(
      isBlockedByGuards([guard], { chainId: 137, signerAddress: SIGNER }, "B")
    ).toBe(false);
    expect(
      isBlockedByGuards(
        [{ chainId: 137, signerAddress: SIGNER }],
        {
          chainId: 137,
          signerAddress: SIGNER,
          actionFingerprint: "transfer|token|alice|1",
        },
        "B"
      )
    ).toBe(false);
  });

  it("neither guard fires when there are no guards", () => {
    const candidate = {
      chainId: 137,
      signerAddress: SIGNER,
      actionFingerprint: "x",
    };
    expect(isBlockedByGuards([], candidate, "A")).toBe(false);
    expect(isBlockedByGuards([], candidate, "B")).toBe(false);
  });
});
