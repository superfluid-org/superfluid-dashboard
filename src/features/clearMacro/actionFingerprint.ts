import { ClearMacroAction } from "./dashboardClearMacro";

/**
 * A canonical identity for a Clear Macro action, used by the double-spend guard.
 *
 * While a gasless intent for an action is unresolved, the same action must not also be written
 * directly: the relay can still execute the intent, and a direct write does not consume the
 * forwarder nonce, so `transfer` / `upgrade` / `downgrade` would move funds twice.
 *
 * `actionKind` alone cannot serve as that identity — it cannot tell two `transfer`s with
 * different recipients or amounts apart, so it would block writes that are perfectly safe. The
 * ClearMacro digest is a sharper identity and is already computed, but it binds the nonce and
 * validity window too, so it can never match a freshly-built equivalent action; it stays useful
 * for diagnostics only.
 *
 * What this catches: the escape-hatch affordance, where the action is literally the same
 * object, and a user who rebuilds an identical action by hand. What it does NOT catch: a
 * semantically equivalent action composed differently (two transfers that together equal the
 * pending one, a delete-then-create instead of an update). It is a guard, not a proof.
 */
export function actionFingerprint(action: ClearMacroAction): string {
  const parts = (...fields: (string | bigint | number)[]) =>
    [action.kind, ...fields.map(normalize)].join("|");

  switch (action.kind) {
    case "approve":
      return parts(action.superToken, action.spender, action.amount);
    case "transfer":
      return parts(action.superToken, action.receiver, action.amount);
    case "upgrade":
    case "downgrade":
      return parts(action.superToken, action.amount);
    case "createFlow":
    case "updateFlow":
      return parts(action.superToken, action.receiver, action.flowRate);
    case "deleteFlow":
      return parts(action.superToken, action.sender, action.receiver);
    case "scheduleFlow":
      return parts(
        action.superToken,
        action.receiver,
        action.startDate,
        action.flowRate,
        action.endDate
      );
    case "deleteFlowSchedule":
      return parts(action.superToken, action.receiver);
    default: {
      // A new action kind must be given an explicit fingerprint here. Failing to compile is the
      // point: silently falling back to the kind alone would over-block, and falling back to a
      // random value would under-block and reopen the double-spend.
      const exhaustive: never = action;
      throw new Error(
        `Unhandled Clear Macro action kind: ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

/**
 * Addresses lowercased (the same address reaches us in mixed checksum casings) and numerics as
 * decimal strings (so a `bigint` and the string it round-trips to through redux-persist agree).
 */
function normalize(value: string | bigint | number): string {
  if (typeof value === "string") return value.toLowerCase();
  return value.toString(10);
}

/**
 * Whether a candidate write is blocked by an unresolved gasless intent.
 *
 * Guard A (nonce collision) is keyed on `(chainId, signerAddress)` alone: the forwarder uses
 * nonce key 0, so any second gasless payload for the same signer reuses the same on-chain nonce
 * and creates competing intents. Guard B (double spend) additionally requires the action to
 * match.
 *
 * Both are best-effort and per-browser — they live in redux-persist, so another tab with
 * separate storage, another device, or another owner of the same Safe can still collide.
 * Provider-side nonce exclusion is the intended real mechanism.
 */
export function isBlockedByGuards(
  guards: {
    chainId: number;
    signerAddress: string;
    actionFingerprint?: string;
  }[],
  candidate: {
    chainId: number;
    signerAddress: string;
    /** Absent when the write has no macro equivalent, in which case only Guard A can apply. */
    actionFingerprint?: string;
  },
  guard: "A" | "B"
): boolean {
  return guards.some((g) => {
    if (g.chainId !== candidate.chainId) return false;
    if (g.signerAddress.toLowerCase() !== candidate.signerAddress.toLowerCase()) {
      return false;
    }
    if (guard === "A") return true;
    // Guard B needs both sides identified; an unidentifiable action is not evidence of a match.
    return (
      !!g.actionFingerprint &&
      g.actionFingerprint === candidate.actionFingerprint
    );
  });
}
