# Clear Macro gasless relay for Safes

Enables the Clear Macro gasless relay for a Safe connected as a Safe App, authorized by an
off-chain Safe message instead of an EOA signature. Companion to
`clear-macro-relay-integration.md`, which covers the EOA path this builds on.

## The shape of the problem

An EOA authorization is synchronous and single-party: prompt, sign, POST, poll, done in seconds.
A Safe authorization is neither. The request must be created before anyone has signed, it may
need days of co-signer time, it has to survive a closed tab, and — the part that drives most of
the design — the dashboard often **cannot tell what happened**.

Three things are unknowable at the moment they matter most:

1. **A rejection from `signTypedMessage` is not a decline.** The Safe wallet's `onTxFlowClose`
   sends the bare string `'Transaction was rejected'` on *any* close of the sign-message flow
   while a request is outstanding, and `SIGNATURE_PREPARED` does not clear the pending request
   id. So a user who declined, a first owner of a 2-of-3 who signed and closed the modal, and —
   because `useSyncSafeMessageSigner` waits `HIDE_DELAY = 3000` ms after proposing and
   refetching — even a sole owner who signed a 1-of-1 and closed quickly all produce the
   identical rejection.
2. **Whether the provider scopes cancellation to the creating client is not established.** The
   OpenAPI makes it conditional on API auth being enabled, and whether it is enabled on this
   deployment could not be determined (a 404 on a bogus id proves nothing either way). What *is*
   established: the dashboard sends no credential at all.
3. **Whether an on-chain-signed Safe message would validate is an open question.** It depends on
   whether the provider polls ERC-1271 with an empty signature or fetches a prepared signature
   from the Transaction Service. Not answered; see "Open questions".

Everything below follows from designing for those three unknowns rather than around them.

## The control flow

`executeSafeAuthorization.ts`, entered from `executeClearMacro` when the resolved authorization
method is `safeMessageV1`.

1. `safe.getInfo()` — require the Safe address to match the signer, the chain to match, and the
   version to be non-null. Capture the threshold. This is the execution-time defence behind the
   connector-id gate in the UI, and it is only sound because the Safe Apps allowed-domain
   patterns are anchored (PR #888) — hence `safeAppsAllowedDomains.ts`, shared with the wagmi
   connector so the two clients cannot drift.
2. `eth.setSafeSettings([{ offChainSigning: true }])`. A request, not a guarantee.
3. Cross-check `safe.calculateTypedMessageHash(typedData)` against the inner digest we already
   computed for the forwarder parity check. A disagreement here means nothing downstream can be
   trusted, and it is far better to stop before an owner is asked to sign.
4. Derive `safeMessageHash` locally (`safeMessageHash.ts`).
5. **Persist the pre-POST intent and flush.** The write guards are armed from this moment.
6. Start `txs.signTypedMessage(typedData)` — **never awaited as the hash source.**
7. **POST immediately**, concurrently with step 6, carrying `authorization` and no `signature`.
8. Promote the intent to a live recovery entry, flush, *then* honour a cancel that raced the POST.
9. Settle by **threshold**: a sole owner keeps the short in-dialog poll; more than one hands off
   to background recovery at once.

### Why the hash is derived locally

`safeMessageHash.ts` reproduces the Safe wallet's `generateSafeMessageHash` byte-for-byte, and
that value is three things at once: what the provider polls ERC-1271 with, the Transaction
Service's key for the message resource, and what the SDK returns on a successful signature.
Computing it ourselves is what makes step 7 legal before any owner has signed.

Two details are easy to get wrong and are unit-tested against Safe's deployed
`SAFE_MSG_TYPEHASH` plus a hand-built EIP-712 derivation: Safes below 1.3.0 omit `chainId` from
the domain, and a null version throws rather than guessing one.

### What happens to the unawaited promise

| outcome | action |
| --- | --- |
| `{ messageHash }` matching ours | fast path; the poll or recovery observes the promotion |
| `{ messageHash }` differing | **cancel.** The owners authorized the wallet's hash while the provider polls ours: it can never authorize and would hold both guards until expiry. Sentry, with both hashes. Never silently re-POST with the wallet's hash |
| `{ safeTxHash }` | on-chain signing. **Cancel** and instruct the user to enable off-chain signing — correct under either answer to the open question |
| rejects | **ambiguous. Never cancel on this alone.** Probe the Transaction Service over a bounded window: found → keep, with confident copy; provably absent → cancel; unavailable → keep, with honest ambiguity copy |

The invariant, which is the thing to preserve if this is ever touched: **the default at every
branch point is to keep the intent, and only a positive "no message exists" cancels one.** There
is no threshold-based auto-cancel anywhere. Two earlier drafts had one and both were wrong.

Note the SDK's off-chain response carries **only** `messageHash` — there is no `signature` field
on it in safe-apps-sdk v9.

## The two guards

While an unresolved Safe intent exists for `(chainId, signerAddress)`:

- **Guard A — nonce collision.** Blocks another *gasless* request for the same signer and chain.
  The forwarder uses nonce key 0, so a second payload reuses the same on-chain nonce and creates
  competing intents that can both admit. The provider does not reject or supersede these, and
  the maintainer is explicit that per-intent nonce keys are not the fix — provider-side nonce
  exclusion is the intended mechanism.
- **Guard B — double spend.** Blocks *that action's* direct write until a cancel returns 2xx. A
  direct write does not consume the forwarder nonce, so a still-valid intent for `transfer`,
  `upgrade` or `downgrade` would move funds a second time. Enforced at exactly one point, the
  self-pay gate in `useSuperfluidWriteContract`.

Guard B needs an action identity, and `actionKind` is not one — it cannot tell two `transfer`s
with different recipients apart. `actionFingerprint.ts` provides a canonical serialization of
the full action union. It catches the escape-hatch affordance and a hand-rebuilt identical
action; it does **not** catch a semantically equivalent action composed differently. It is a
guard, not a proof.

Both guards are **per-browser**: they live in redux-persist, so another tab with separate
storage, another device, or another owner of the same Safe can still collide. Both apply only
to Safe entries — EOA executions carry a 600s window and no fingerprint, and guarding them would
block a normal user's direct writes for ten minutes after every gasless send.

## Releasing a guard

Only on a **positive answer**: a confirmed terminal state, a cancel that returned 2xx, an expiry
past which the payload can no longer land, or the user's explicit acknowledged override. Never
on a timeout, a deadline, a 5xx, or an unreachable provider.

`useClearMacroRelayRecovery` therefore separates three things the previous code conflated:

| situation | stop polling | stop nagging | release the guard |
| --- | --- | --- | --- |
| confirmed terminal | yes | yes | **yes** |
| cancel returned 2xx | yes | yes | **yes** |
| confirmed 404 | yes | yes | no — tombstone until `validBefore + grace` |
| provider unreachable 24h+ | yes | yes | no — tombstone |
| `submitted` past `validBefore` | **no** | no | no |

The 24-hour bound is the one to be careful with. An earlier design *deleted* the entry there,
which against a 72-hour window silently reopened the exact double-spend the guards exist to
prevent. It now demotes to a passive tombstone instead.

A confirmed 404 does not release either, because client scoping is unknown (unknown #2 above):
a 404 means "not visible to us", not "does not exist".

The manual override ("I've confirmed in Safe that this won't execute — release it") exists so a
permanently dead provider cannot brick an account's direct writes forever. It is a deliberate,
user-acknowledged risk, worded as one.

## Cancellation

`DELETE /v1/relay-executions/{id}`, cancelable in `awaiting_authorization` or in `pending` before
submission, idempotent once already cancelled.

**Abandon means cancel → 2xx → then permit the direct write.** On 409 the execution is already
claimed and the direct write stays blocked; on a network failure the outcome is unknown, which
has to be treated the same way. Blocking on an unknown outcome is the only safe default.

Branch on the **HTTP status, never the error code string** — the 409's code is not in the
provider's documented list and could not be confirmed without cancelling a real execution.

Two races are handled explicitly. A cancel decided while the POST is still in flight has no id
to cancel, so a durable `cancelRequested` flag is written *before* the attempt; the POST
completion path and the pre-POST replay path both honour it, the latter by obtaining the id and
cancelling rather than promoting. And cancelling does **not** revoke the Safe message: co-signers
can still confirm it, harmlessly for this execution but alarmingly for an owner watching the Safe
UI, so the copy says so.

## Ambiguous POST failures

The provider deduplicates creates on the signed authorization intent, so a POST whose outcome we
never learned is replayed **byte-for-byte** from the persisted `postBody` — 200 returns the
original execution, 202 means the first never landed. The body is stored as a string rather than
an object precisely so nothing (key order, number formatting, a persist round-trip) can change
between the original and the replay.

## Validity window

72 hours (`SAFE_VALIDITY_WINDOW_IN_SECONDS`), against 600s for EOAs. There is one clock — the
payload's own `validBefore` — and no separate provider poll TTL.

The bound is deliberate rather than generous. The cost of a longer window is not provider-side:
the execution id is the only handle on a live intent (there is no lookup by signer), so a user
who clears browser data or moves device can neither cancel it nor safely write that action
directly until it closes. 72 hours still covers the real case — a Friday-afternoon proposal
reaching a Monday-morning co-signer is about 64 hours.

There is deliberately **no** cross-device "paste an execution id to resume" flow: whether it
would work at all depends on the provider auth mode that unknown #2 covers. The id is instead
surfaced prominently and copyably everywhere it appears.

## Fees

The provider's schema rejects an `authorization` block on `clearMacroPermit2V1`, so a Safe can
only relay from an existing USDCx balance — there is no just-in-time USDC wrap. The payment
selector and its approval button are hidden, `usdcx-direct` is forced in execution **without**
writing it back to the user's persisted preference, and a shortfall gets an explicit "wrap or
top up USDCx first" remedy rather than pointing at an option that is not there.

## A Safe never falls back to a paid write

For an EOA, a pre-signature `ClearMacroNotEligibleError` falls through to a normal self-paid
transaction. For a Safe it does not. Gasless→paid is not a cost detail there: it is a different
multi-owner ceremony with its own co-signer round and its own gas, and the user opted into
gasless explicitly. If they want the paid path they turn gasless off themselves, which goes
through the guards.

Eligibility is resolved *before* entering the relay branch so this keys off a settled answer — a
Safe on a signature-only chain stays ineligible and takes the ordinary paid path, which is the
right outcome there rather than a hard error.

## Open questions

- **Does the provider poll ERC-1271 with an empty signature, or fetch `preparedSignature` from
  the Transaction Service?** It decides whether an on-chain signed Safe message (which sets
  `signedMessages[hash]`, making `isValidSignature(digest, "0x")` return the magic value) would
  validate. The prescribed action for that branch — cancel and instruct — is safe under both
  readings, so nothing is blocked, but the rationale must not be written down as fact until it
  is answered.
- **Is API auth enabled on the live provider deployment?** Nothing shipped depends on the
  answer, by design. If a future change needs to know, that is a question for the maintainer,
  not something to infer from probes.

## What is not verified

The full multi-owner path needs a funded Safe opened as a Safe App on a chain the live
capability set enables for `safeMessageV1`, with enough USDCx for the fee. Derive that chain list
at test time from `/v1/capabilities` rather than from any list written down here.

Unit tests cover the hash derivation (including a sub-1.3.0 domain), the version comparison, the
action fingerprint, the guard predicates, and the tx-service probe's failure modes. Everything
involving a real Safe — the 2-of-3 happy path, first-owner-signs-then-closes, decline,
signed-inside-`HIDE_DELAY`, and the on-chain signing branch — remains unverified.
