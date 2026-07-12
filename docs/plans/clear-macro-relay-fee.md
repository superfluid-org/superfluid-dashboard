# Clear Macro relay fee — implementation record + Phase 2 handoff

This is the working document for adding a relay **fee** to the Clear Macro path and letting users
**pay it in USDCx or USDC**. Phase 0 (contract), Phase 1 (USDCx-direct UI), **and Phase 2
(pay-with-USDC via Permit2) are all IMPLEMENTED** — §10 is the Phase 2 implementation record
(including deliberate deviations from the §9 handoff); only the browser E2E run (§8/§I.6) remains.
It complements [`clear-macro-relay-integration.md`](./clear-macro-relay-integration.md) (the base
relay integration) — read that first for the overall relay architecture.

> **Superseded (2026-07-13):** the fee weighting described below was `baseFee × txCount` (new schedule
> 2×/3×) with base `0.01`. It has since changed to weighted fee units — a new schedule pays **2× base per
> reserved keeper execution** on top of the 1× relay fee (3× one date, 5× both), modify/cancel stay 1× —
> with base `0.1`. See `contracts/README.md` (Fees) and `clear-macro-multi-network-deploy.md` (fee policy)
> for the current model; the text below is kept as the implementation record of Phases 0–2.

---

## 1. Context / why

`DashboardClearMacro` charges a relay fee (`baseFee × txCount` in a fee Super Token, e.g. USDCx) inside the
macro batch — `txCount` = the number of transactions the relay executes: **1×** for any plain action or a
schedule modify/cancel, **2×/3×** for a *new* schedule (it reserves its keeper executions). The dashboard
must (a) disclose the fee honestly (the chip used to say "gasless"), (b) stop users signing into a
guaranteed revert when they can't pay, and (c) ideally let them pay from **USDC** (auto-wrapped to USDCx
via the forwarder's Permit2 path) as well as from **USDCx** directly.

---

## 2. Current state (DONE — Phase 0 + Phase 1)

### Phase 0 — contract (`contracts/src/DashboardClearMacro.sol`)
- `_scheduleTxCount(p, account) → (currentTx, maxTx)` — the single definition of the schedule multiplier,
  shared by `_buildOperationsScheduleFlow` and the preview.
- `previewRelayFee(bytes actionParams, address account) → (ISuperToken feeToken, address feeReceiver,
  uint256 currentFee, uint256 maxFee)` — `actionParams` is the output of `encode<Action>`. `currentFee` is
  the exact charge now (accounts for new-vs-modify via `account`); `maxFee` is the upper bound (schedule
  treated as new). Reverts `UnknownActionId` for unregistered ids (via `_getAction`).
- `feeToken()` / `baseFee()` getters (action-independent, for the chip).
- Tests: `testPreviewRelayFee*` (4) + the existing fee tests — **44/44 pass**. ABI regenerated
  (`pnpm contracts:abi`, 35 entries).

### Phase 1 — frontend (USDCx-direct, architected for Permit2)
- `src/features/clearMacro/relayApi.ts`: `RelayKind = "clearMacroV1" | "clearMacroPermit2V1"`;
  `supportedKinds` on `RelayCapabilities.chains[]`; `CreateRelayExecutionBody = ClearMacroV1Body |
  ClearMacroPermit2V1Body` (discriminated on `kind`); `RelayExecution.kind` widened to `RelayKind`.
  **`ClearMacroPermit2V1Body` is already defined** (the exact provider shape) — Phase 2 just constructs it.
- `src/features/clearMacro/executeClearMacro.ts`: `ClearMacroPaymentMode = "usdcx-direct" | "usdc-permit2"`
  + `paymentMode` param (default `usdcx-direct`); `ClearMacroInsufficientFeeError`; a fee-readiness guard
  placed **after** the assembly `try/catch` (so it isn't wrapped into the silent-fallback
  `ClearMacroNotEligibleError`). The guard: tolerant `previewRelayFee` read (`.catch(()=>undefined)` — keeps
  working against the OLD feeless macro), gates on **`maxFee`**, applies a same-fee-token adjustment
  (`upgrade` mints / `transfer`·`downgrade` spend the fee token in-batch), and reads the signer's
  `realtimeBalanceOfNow` **availableBalance**. `actionParams` is hoisted out of the try for reuse.
- `src/features/transactions/useSuperfluidWriteContract.ts`: passes `paymentMode: "usdcx-direct"`; surfaces
  `ClearMacroInsufficientFeeError` (rethrow, not silent self-pay) and skips it in `onError` Sentry logging.
- `src/features/clearMacro/useRelayFee.ts` (new) + `ClearMacroRelayOption.tsx`: `useRelayFeeDisclosure`
  reads `feeToken()`/`baseFee()` and formats; chip copy is now "Relay pays gas via Clear Macro" + a
  `Fee: …` line (drops "gasless"); tooltip updated.

### Verification status
`forge test` 44/44 ✅, `pnpm contracts:abi` ✅, `pnpm typecheck` ✅, changed files lint-clean ✅. Reviewed
twice by Codex (see §6). **End-to-end runtime NOT yet exercised** — blocked on the deployment prerequisite.

### Test hardening (2026-07-08)
Contract suite expanded **44 → 80 tests** across 3 files (shared harness extracted to
`contracts/test/DashboardClearMacroTestBase.t.sol`, identical pass list verified before/after):
- `DashboardClearMacro.t.sol` (+10): constructor zero-address guards (flowScheduler, fee token,
  fee receiver) and the 1e13 minimum-fee acceptance; `feeToken()`/`baseFee()` getters; start-only
  `previewRelayFee` (2×); lower-rate modify leaves the operator allowance untouched (grant op elided);
  truncated/malformed `actionParams` revert; **exact** description strings for CreateFlow and all three
  ScheduleFlow branches — the fee literals (`0.00100`/`0.00200`/`0.00300`) the struct hash commits to.
- `FormatterLibs.t.sol` (new, 16 + 3 fuzz): literal expectations for rounding half-up, trailing-zero
  and leading-zero padding, carry into the integer part, all periods; the round-trip fuzz **mechanizes
  the "disclosed == charged for multiples of 1e13" invariant** behind `FeeNotRepresentable`.
  `InvalidPeriod` is unreachable at solc 0.8.30 (enum cleanup panics 0x21 first) — locked in as such.
- `DashboardClearMacroEip712.t.sol` (new, 7): typedef/primaryType literals for all 9 actions
  (redeclared in-test so contract drift fails), ERC-5267 domain check, independent digest recomputation
  layer-by-layer, an execution signed from a **recomputed** digest (never calling `getDigest`), and
  description-commitment checks for all 9 action struct hashes.
- New `pnpm contracts:coverage` (lcov + summary, src-only): `DashboardClearMacro.sol` 100% lines /
  93.3% branches / 100% funcs; `FormatterLibs.sol` 94.4% lines (only the unreachable defensive revert).

### Deployment prerequisite — RESOLVED (2026-07-07)
The 5-arg fee macro is deployed on OP Sepolia (see §9-H) and `networks.ts`
`dashboardClearMacro.macroAddress` now points at **`0x576d1274Ef1E4e1f6093ffC1188c8D32411dDD65`**;
the deployed-instance comment in `src/features/clearMacro/dashboardClearMacro.ts` was refreshed.
Only the browser E2E run remains blocked on a funded test wallet session.

---

## 3. Phase 2 goal — pay the fee in USDC via Permit2

Let a user without USDCx pay the fee from **USDC**: one Permit2 `PermitWitnessTransferFrom` signature
authorizes the forwarder to pull USDC, wrap it to USDCx (credited to the signer) just-in-time, and run the
macro — all in one relayed transaction. **No external work needed** (verified live): the provider, the
deployed forwarder, and `@sfpro/sdk` already support it.

---

## 4. Verified mechanics (the crux — don't re-derive, these were checked against source + live)

**Forwarder** `ClearMacroForwarderV1WithPermit2` (in the submodule; the deployed
`0xc1eab73855155d4e021f7eb4f866996bac2fe25e` on every chain incl. OP Sepolia IS this variant —
`PERMIT2()` returns the canonical Permit2 addr `0x000000000022D473030F116dDEE9F6B43aC78BA3`):
```
runPermit2AndMacro(Permit2MacroParams p, IClearMacro m, bytes params)
Permit2MacroParams { IPermit2.PermitTransferFrom permit; address owner; bytes32 witness;
                     string witnessTypeString; bytes signature; address spender; address upgradeSuperToken; }
```
When `upgradeSuperToken != address(0)` it: Permit2-pulls `permit.permitted.amount` of USDC from `owner`
(the signer) to the forwarder (Permit2 checks `spender == msg.sender == forwarder` and the witness) →
`approve` + host `OPERATION_TYPE_SUPERTOKEN_UPGRADE_TO` → **USDCx minted to `owner`** → then the macro runs
(the fee `transferFrom` of USDCx from the signer now succeeds). One signature; the witness binds the whole
ClearMacro payload, so there is **no** separate ClearMacro signature in this path.

**@sfpro/sdk `clearMacroForwarderAbi`** already exports: `runPermit2AndMacro`,
`getPermit2WitnessStructHash(m, params, upgradeSuperToken) → bytes32`, and
`getPermit2WitnessTypeString(m, params) → string`.

**Live relay** (`GET /clearmacro-provider/v1/capabilities`): every chain lists
`supportedKinds: ["clearMacroV1","clearMacroPermit2V1"]`. The `POST /v1/relay-executions` body for the
permit2 kind (already typed as `ClearMacroPermit2V1Body` in `relayApi.ts`):
```jsonc
{ "kind": "clearMacroPermit2V1", "chainId", "macroAddress", "signerAddress", "payload",
  "permit2": { "permit": { "permitted": { "token": <USDC>, "amount": <string, USDC units> },
                           "nonce": <string>, "deadline": <string> },
               "spender": <forwarder>, "upgradeSuperToken": <USDCx>, "signature": <hex> } }
```
The provider **derives the witness on-chain** (from `macroAddress`+`payload`+`upgradeSuperToken`), so the
frontend does NOT send `witness`/`witnessTypeString` — only the fields above.

**Permit2 typed data the frontend must sign** (Uniswap SignatureTransfer):
- domain `{ name: "Permit2", chainId, verifyingContract: 0x0000…22D473…78BA3 }`
- primaryType `PermitWitnessTransferFrom`, types:
  `PermitWitnessTransferFrom(TokenPermissions permitted,address spender,uint256 nonce,uint256 deadline,ClearMacro witness)`,
  `TokenPermissions(address token,uint256 amount)`, and the `ClearMacro(...)Action(...)Security(...)` witness
  types — **get the witness type string from `getPermit2WitnessTypeString(macro, encodedPayload)`** and parse
  it (reuse `parseEIP712TypeDef`). **Live-read from the forwarder on OP Sepolia (2026-07-07, transfer action):**
  ```
  ClearMacro witness)Action(string description,address token,address receiver,uint256 amount)ClearMacro(address upgradeSuperToken,Action action,Security security)Security(string domain,address macroContract,string provider,uint256 validAfter,uint256 validBefore,uint256 nonce)TokenPermissions(address token,uint256 amount)
  ```
  So the witness primary type is `ClearMacro(address upgradeSuperToken, Action action, Security security)`
  (derive the name as `witnessTypeString.split(" witness)")[0].trim()`); its `Action`/`Security` sub-structs
  are byte-identical to the usdcx-direct path (same on-chain `description`/`resolveActionFieldValue`/`security`).
  See §9 for the full code-level build guide.
- message: `permitted { token: feeUnderlying(USDC), amount: <maxFee → USDC units, ceil> }`,
  `spender: forwarderAddress`, `nonce: <fresh Permit2 unordered nonce>`,
  `deadline: security.validBefore`, `witness: { upgradeSuperToken: feeToken(USDCx), action, security }`.

---

## 5. Phase 2 implementation steps

1. **Capability gate.** Enable pay-with-USDC only when `getCapabilities()` lists `clearMacroPermit2V1` for
   the chain AND the fee token's underlying (USDC) resolves. Add a `PERMIT2` address const to `networks.ts`
   (or a shared const).
2. **One-time approval (self-pay, NOT relayed).** Ensure `USDC.allowance(signer, PERMIT2) ≥ maxFee` via
   `getErc20Allowance` (`src/features/transactions/contractReads.ts`); if not, a normal `approve(PERMIT2,
   max)` write. **Must go through the normal self-pay path — never tagged `clearMacro`** (otherwise it gets
   relayed and eats its own fee). Note `useTokenWrap` auto-tags upgrades with `clearMacro`; do not reuse it
   blindly for this approval.
3. **Extend `executeClearMacro`'s `usdc-permit2` branch:** build `encodedPayload` as today → read
   `getPermit2WitnessStructHash` + `getPermit2WitnessTypeString` → assemble the Permit2 typed data (§4) →
   ONE `signTypedData` (replaces the ClearMacro signature for this mode) → POST `ClearMacroPermit2V1Body`.
   Poll/recover exactly as today (same executionId lifecycle). **Never fall back after this signature.** Skip
   the USDCx readiness guard in this mode (the wrap creates the balance); instead pre-check USDC balance ≥
   `maxFee → USDC units`. Size the permit against **`maxFee`** (surplus USDCx, if the macro charges 1×,
   simply stays with the signer).
4. **Decimal conversion:** `permit.permitted.amount` is in the underlying's decimals (USDC = 6), `maxFee` is
   18-dec USDCx. Convert `maxFee` down using the underlying token's actual decimals (from the token list),
   **rounding up**. Don't hardcode 6.
5. **Permit2 nonce:** an unordered SignatureTransfer nonce (bitmap-based). A large random-ish nonce is fine;
   the relay/Permit2 rejects a reused one. (Generation must avoid `Math.random` if this ever runs in a
   deterministic context; a timestamp/word-based nonce is fine in the browser.)
6. **UI:** a payment-method selector (USDCx vs USDC) in the chip, shown when the user lacks USDCx but has
   USDC and capability is present. Wire the chip's insufficient-USDCx state to offer "Pay with USDC". Update
   the tooltip for the permit2 path (still one signature).

---

## 6. Design decisions & gotchas (from reviews — honor these)
- **Size against `maxFee`, not `currentFee`** — schedule state can change between sign and execution; the
  signed description discloses both, so `maxFee` is the honest, safe bound. (Phase 1's guard was corrected
  to this.)
- **Fee readiness is necessary, not sufficient** — the action itself may move the fee token
  (transfer/downgrade spend, upgrade mints). Same-fee-token adjustment is in Phase 1; keep it.
- **One signature per mode** — usdcx-direct = ClearMacro sig; usdc-permit2 = Permit2 witness sig. Never
  layer both.
- **Preparatory approve/wrap must bypass ClearMacro** (else it consumes its own fee).
- **`ClearMacroInsufficientFeeError` is not a silent fallback** and is Sentry-skipped.
- **Backward-compat:** every macro read that Phase 0 added (`previewRelayFee`, `feeToken`, `baseFee`) must
  stay tolerant of the old feeless deployment until the new macro is live.
- **The fee-readiness guard is best-effort by construction** — the tolerant `previewRelayFee` read
  (`.catch(() => undefined)`) can't tell "function missing" (old feeless macro) from a transient RPC
  failure, so the latter silently skips the guard. Worst case is bounded: the relay's own preflight/
  execution reverts and the failure surfaces post-signature, but no fee is charged (the batch is atomic).
  Accepted for Phase 1; see §7 for the planned narrowing.
- **The modify-fee simplification is deliberate** — an existing schedule row is always 1×, even when the
  modify adds a previously-absent date (or the row was created directly against the FlowScheduler). Locked
  in by `testModifyAddingDateChargesBaseOnly` / `testDirectScheduleThenMacroModifyChargesBaseOnly`: it keeps
  the contract simple and isn't realistically gameable for meaningful gain (direct scheduling costs the
  user their own gas).

## 7. Deferred from Phase 1 (status after Phase 2)
- ~~Chip **readiness affordance**~~ — DONE in Phase 2: the payment selector shows both balances,
  tags shortfalls "(insufficient)", and offers "Pay with USDC" + the inline one-time approve.
- ~~**Narrow the fee-guard tolerance**~~ — DONE in Phase 2 (`readRelayFeeQuote`): only a zero-data
  read (function missing = old feeless macro) is treated as feeless; any other `previewRelayFee`
  failure throws `ClearMacroNotEligibleError` (degrades to self-pay) instead of silently skipping
  the guard.
- Chip **schedule fee label** shows the full new-schedule range for all scheduling (since 2026-07-13:
  "up to 5×"; a start/stop-only new schedule is only 3×) — conservative; exact needs the full action
  params via `previewRelayFee`. STILL DEFERRED.
- ~~Deploy the fee macro + update `networks.ts` + the stale ABI-module comment~~ — DONE (§9-H).

## 8. Verification (Phase 2)
`pnpm typecheck`; then against a deployed fee macro on OP Sepolia: with a signer holding **only USDC**
(zero USDCx) and a one-time Permit2 approval done, drive a relayable action with "Pay with USDC" — confirm
one signature, `clearMacroPermit2V1` submission, USDCx minted just-in-time, fee paid to the receiver, and
the action executed. Use the browser MCP tools. Re-confirm the usdcx-direct path still works unchanged.

---

## 9. Phase 2 — detailed implementation handoff (pay the relay fee in USDC via Permit2)

> Scope: implement the `usdc-permit2` payment mode end-to-end — executor branch, relay body, payment-mode
> plumbing, the one-time self-pay USDC→Permit2 approval, and the fully-polished chip selector. Phases 0/1 are
> done (see §2) and uncommitted. Nothing external blocks this (§3). All mechanics in §9-A were **live-read
> from the deployed forwarder on OP Sepolia** and the installed `@sfpro/sdk@0.2.2` — do not re-derive them.
> Decisions already taken with the repo owner: **build the full polished UI now**; the one-time approve is a
> **proactive two-step button** (wrap-tab pattern). This supersedes the terser §5/§6 as the build guide.

### A. Verified mechanics (the crux — live-read, don't re-derive)

**Forwarder & Permit2.** The deployed `ClearMacroForwarder` `0xC1EaB73855155D4e021f7EB4f866996Bac2fe25e`
(resolve via `clearMacroForwarderAddress[chainId]`) is the Permit2-capable variant on every chain. Its
`PERMIT2()` getter returns the canonical Uniswap Permit2 `0x000000000022D473030F116dDEE9F6B43aC78BA3`
(verified live). `@sfpro/sdk@0.2.2`'s `clearMacroForwarderAbi` (from `@sfpro/sdk/abi`) exports all four
needed functions (confirmed present in the installed package):
- `runPermit2AndMacro(Permit2Context permit2Context, address m, bytes encodedPayload) payable → bool`
  — NOTE the wrapping struct is **`Permit2Context`** (not `Permit2MacroParams`): fields in order `permit
  {permitted {token,amount}, nonce, deadline}, owner, witness (bytes32), witnessTypeString (string),
  signature (bytes), spender, upgradeSuperToken`. The frontend never calls this directly — the relay does.
- `getPermit2WitnessStructHash(address m, bytes encodedPayload, address upgradeSuperToken) view → bytes32`
- `getPermit2WitnessTypeString(address m, bytes encodedPayload) view → string`
- `PERMIT2() view → address`

**The witness type string (live-read from the forwarder, transfer action):**
```
ClearMacro witness)Action(string description,address token,address receiver,uint256 amount)ClearMacro(address upgradeSuperToken,Action action,Security security)Security(string domain,address macroContract,string provider,uint256 validAfter,uint256 validBefore,uint256 nonce)TokenPermissions(address token,uint256 amount)
```
Reading (Uniswap SignatureTransfer convention): the witness primary type is
`ClearMacro(address upgradeSuperToken, Action action, Security security)`, and its `Action`/`Security`
sub-structs are **byte-identical to the usdcx-direct path** — the same on-chain `describe<Action>` output,
`resolveActionFieldValue`, and `security` object are reused verbatim inside `witness`. `parseEIP712TypeDef`
(existing, in `dashboardClearMacro.ts`) extracts `Action`/`ClearMacro`/`Security`/`TokenPermissions` cleanly
from this string — the leading `ClearMacro witness)` fragment has no `(` so its regex ignores it. The `Action`
field list is action-specific (e.g. `deleteFlow` → `description,token,sender,receiver`); always take it from
the parsed string, never assume.

**The Permit2 typed data to sign (viem `signTypedData`):**
- `domain = { name: "Permit2", chainId, verifyingContract: PERMIT2_ADDRESS }` — **no `version` field**.
- `primaryType = "PermitWitnessTransferFrom"`.
- `types` = the fixed outer type + the parsed witness types:
  ```
  PermitWitnessTransferFrom(TokenPermissions permitted,address spender,uint256 nonce,uint256 deadline,ClearMacro witness)
  ```
  merged with parsed `TokenPermissions` / `ClearMacro` / `Action` / `Security`. (No `EIP712Domain` entry —
  viem derives it.)
- `message`:
  ```
  {
    permitted: { token: <USDC underlying>, amount: <maxFee → underlying units, ceil (bigint)> },
    spender:   <forwarderAddress>,
    nonce:     <fresh Permit2 unordered nonce (bigint)>,
    deadline:  <security.validBefore (bigint)>,
    witness: {
      upgradeSuperToken: <feeToken = USDCx>,
      action:   <same actionMessage as usdcx-direct>,
      security: <same securityMessage as usdcx-direct>,
    },
  }
  ```

**Local pre-signature verification (Permit2 analog of the existing `getDigest` guard).** `viem` exports
`hashStruct` (confirmed). Cross-check the witness before signing:
`hashStruct({ data: message.witness, primaryType: "ClearMacro", types: witnessTypes })` **must equal**
`getPermit2WitnessStructHash(macro, encodedPayload, feeToken)`. This anchors the drift-prone
ClearMacro/Action/Security/`upgradeSuperToken` portion to the chain; the fixed outer Permit2 fields
(permitted/spender/nonce/deadline) we control directly. On mismatch → `ClearMacroNotEligibleError` (safe
self-pay fallback — self-pay needs no USDCx). NOTE: `getPermit2WitnessStructHash` reads on-chain state (it
recomputes the description), so it **reverts on non-contract token args** — only exercise it with real tokens.

**The relay body (already typed as `ClearMacroPermit2V1Body` in `relayApi.ts`).** The provider derives the
witness on-chain, so the body **omits** `witness`/`witnessTypeString`:
```jsonc
{ "kind": "clearMacroPermit2V1", "chainId", "macroAddress", "signerAddress", "payload": <encodedPayload>,
  "permit2": { "permit": { "permitted": { "token": <USDC>, "amount": <string, underlying units> },
                           "nonce": <string>, "deadline": <string> },
               "spender": <forwarder>, "upgradeSuperToken": <USDCx>, "signature": <hex> },
  "metadata": { "source": "dashboard" } }
```
Amounts/nonce/deadline are **decimal strings**. `createRelayExecution` already accepts this body — no
`relayApi` change needed beyond a small capability helper.

### B. Execution layer

#### B1. New: `src/features/clearMacro/permit2.ts` (pure helpers)
```ts
export const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3" as const;

/** Unordered SignatureTransfer nonce; crypto-random (NOT Math.random, per guardrail). */
export function generatePermit2Nonce(): bigint {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytes.reduce((acc, b) => (acc << 8n) | BigInt(b), 0n);
}

/** 18-dec fee Super Token amount → underlying units, rounding UP. Never hardcode 6. */
export function feeToUnderlyingUnitsCeil(feeWei18: bigint, underlyingDecimals: number): bigint {
  const diff = 18 - underlyingDecimals;
  if (diff === 0) return feeWei18;
  if (diff < 0) return feeWei18 * 10n ** BigInt(-diff);        // >18-dec underlying (rare)
  const scale = 10n ** BigInt(diff);
  return (feeWei18 + scale - 1n) / scale;                       // ceil
}
```
Plus the fixed `PermitWitnessTransferFrom` field list + a `buildPermit2Types(witnessTypes, witnessTypeName)`
that returns `{ PermitWitnessTransferFrom: [...], ...witnessTypes }`.

#### B2. `src/features/clearMacro/executeClearMacro.ts` — refactor + implement `usdc-permit2`
Refactor the single assembly `try` so these are **shared** across modes: `getNonce`, `encode<Action>` →
`actionParams`, `security`, `encodeParams` → `encodedPayload`, `describe<Action>` → `description`, and a new
extracted helper `buildActionSecurityMessages(actionTypeFields, securityTypeFields, action, description,
security)` (the existing field-by-parsed-name loops, returning `{ actionMessage, securityMessage }`, throwing
`ClearMacroNotEligibleError` on an unknown field). Then branch on `params.paymentMode`:

**`usdcx-direct`** — unchanged: parse `getTypeDefinition` + `getPrimaryTypeName` + `eip712Domain`, build the
ClearMacro typed data, `getDigest` cross-check, sign, POST `clearMacroV1`. Keep the existing USDCx
fee-readiness guard (previewRelayFee → `realtimeBalanceOfNow.availableBalance`, gated on `maxFee`,
same-fee-token adjustment).

**`usdc-permit2`** — new branch (sketch):
```ts
// 0. defensive capability gate (chip already checked; guards a stale UI)
if (!chainSupportsPermit2(capabilities, chainId))
  throw new ClearMacroNotEligibleError("Relay does not support clearMacroPermit2V1 on this chain.");

// 1. fee + underlying resolution
const quote = await readContract(previewRelayFee(actionParams, signer)).catch(() => undefined);
const feeToken = quote?.[0]; const maxFee = quote?.[3] ?? 0n;
if (!feeToken || maxFee === 0n) throw new ClearMacroNotEligibleError("No relay fee to fund via Permit2.");
const feeTokenInfo = findTokenFromTokenList({ chainId, address: feeToken });
const underlying = (feeTokenInfo as SuperTokenMinimal)?.underlyingAddress;
if (!underlying) throw new ClearMacroNotEligibleError("Fee token has no resolvable underlying.");
const underlyingDecimals = findTokenFromTokenList({ chainId, address: underlying })?.decimals;
if (underlyingDecimals == null) throw new ClearMacroNotEligibleError("Underlying decimals unknown.");
const requiredUsdc = feeToUnderlyingUnitsCeil(maxFee, underlyingDecimals);

// 2. witness typed data
const witnessTypeString = await readContract(getPermit2WitnessTypeString(macro, encodedPayload));
const witnessTypes = parseEIP712TypeDef(witnessTypeString);
const witnessTypeName = witnessTypeString.split(" witness)")[0].trim();     // "ClearMacro"
const clearMacroFields = witnessTypes[witnessTypeName];                      // upgradeSuperToken/action/security
const actionType = clearMacroFields.find(f => f.name === "action")?.type;    // "Action"
const securityType = clearMacroFields.find(f => f.name === "security")?.type; // "Security"
// (guard actionType/securityType/witnessTypes[...] presence → ClearMacroNotEligibleError)
const { actionMessage, securityMessage } = buildActionSecurityMessages(
  witnessTypes[actionType], witnessTypes[securityType], action, description, security);
const witnessMessage = { upgradeSuperToken: feeToken, action: actionMessage, security: securityMessage };

// 3. verify witness struct hash vs chain (real-token safe here)
const localHash = hashStruct({ data: witnessMessage, primaryType: witnessTypeName, types: witnessTypes });
const chainHash = await readContract(getPermit2WitnessStructHash(macro, encodedPayload, feeToken));
if (localHash.toLowerCase() !== chainHash.toLowerCase())
  throw new ClearMacroNotEligibleError("Permit2 witness struct hash mismatch.");

// 4. pre-signature fee guards (SURFACE, do not fall back)
const usdcBal = await readContract(erc20.balanceOf(underlying, signer));
if (usdcBal < requiredUsdc) throw new ClearMacroInsufficientFeeError(msg, { feeToken: underlying, requiredFee: requiredUsdc, availableBalance: usdcBal });
const allowance = await getErc20Allowance({ chainId, tokenAddress: underlying, ownerAddress: signer, spenderAddress: PERMIT2_ADDRESS });
if (allowance < requiredUsdc) throw new ClearMacroPermit2ApprovalRequiredError(msg, { token: underlying, spender: PERMIT2_ADDRESS, required: requiredUsdc });

// 5. shared fallback simulation (validates the action itself — fee-independent) — keep as today

// 6. ONE signature (replaces the ClearMacro sig)
const permitNonce = generatePermit2Nonce();
const typedData = {
  domain: { name: "Permit2", chainId, verifyingContract: PERMIT2_ADDRESS },
  types: buildPermit2Types(witnessTypes, witnessTypeName),
  primaryType: "PermitWitnessTransferFrom",
  message: { permitted: { token: underlying, amount: requiredUsdc }, spender: forwarderAddress,
             nonce: permitNonce, deadline: security.validBefore, witness: witnessMessage },
};
params.onPhase?.("awaiting-signature");
const signature = await signTypedData(wagmiConfig, { account: signer, ...typedData });

// 7. POST clearMacroPermit2V1 — then IDENTICAL onExecutionCreated + poll + recovery as usdcx-direct
params.onPhase?.("relaying");
const execution = await createRelayExecution({
  kind: "clearMacroPermit2V1", chainId, macroAddress, signerAddress: signer, payload: encodedPayload,
  permit2: { permit: { permitted: { token: underlying, amount: requiredUsdc.toString() },
                       nonce: permitNonce.toString(), deadline: security.validBefore.toString() },
             spender: forwarderAddress, upgradeSuperToken: feeToken, signature },
  metadata: { source: "dashboard" },
});
```
Add error class `ClearMacroPermit2ApprovalRequiredError extends Error` (carries `{ token, spender, required }`)
next to the existing ones. Move the `previewRelayFee` read so both modes use it; keep it `.catch(() =>
undefined)` tolerant of the old feeless deployment.

#### B3. `src/features/clearMacro/relayApi.ts`
Add a pure helper `export function chainSupportsPermit2(caps: RelayCapabilities, chainId: number): boolean`
(`caps.chains.find(c => c.chainId === chainId)?.supportedKinds.includes("clearMacroPermit2V1") ?? false`).
No body-type change.

### C. Payment-mode plumbing (mirror the `clearMacroEnabled` pattern exactly)
- `src/features/settings/appSettings.slice.tsx`: add `clearMacroPaymentMode: ClearMacroPaymentMode` to
  `AppSettingsState` + `initialState` default `"usdcx-direct"`. **No redux-persist migration** — missing keys
  rehydrate to `initialState` (same as `clearMacroEnabled`); `applySettings` merges partials. Import the type
  from `../clearMacro/executeClearMacro`.
- `src/features/settings/appSettingsHooks.tsx`: add
  `export const useClearMacroPaymentMode = () => useSetting("clearMacroPaymentMode") as ClearMacroPaymentMode;`.
- `src/features/transactions/useSuperfluidWriteContract.ts`: read `useClearMacroPaymentMode()` at hook scope
  (beside `useClearMacroEnabled()`, ~line 136); pass it in place of the hardcoded
  `paymentMode: "usdcx-direct"` literal (~line 240). Add `ClearMacroPermit2ApprovalRequiredError` to `onError`
  (early-return, skip Sentry — like `ClearMacroInsufficientFeeError`, line 169) and to the `mutationFn` catch
  (rethrow, no recovery entry — pre-signature, nothing signed). Do not touch the relay-branch gate or the
  recovery lifecycle (mode-agnostic).

The chip is the only writer of `clearMacroPaymentMode`; the write hook reads it globally — the same decoupled
channel `clearMacroEnabled` uses. The active mode is always shown in the chip, so the persisted choice is
visible and reversible (no hidden stickiness).

### D. One-time USDC → Permit2 approval (self-pay, proactive two-step)
- New `src/features/clearMacro/useApproveUsdcForPermit2.ts`: clone `useTokenApprove`
  (`useTokenWrapWrites.ts:21-40`) —
  `write({ abi: erc20Abi, address: <underlying>, functionName: "approve", args: [PERMIT2_ADDRESS, maxUint256],
  title: "Approve Allowance" })`. **No `clearMacro` field** → the relay-branch gate (line 214) is skipped and
  it self-pays via `writeContract` (never eats its own fee). `"Approve Allowance"` is already a valid
  `TransactionTitle` (`adHocRpcEndpoints.ts:22`).
- Gate on `getErc20Allowance({ tokenAddress: underlying, ownerAddress: signer, spenderAddress: PERMIT2_ADDRESS
  }) >= requiredUsdc` (pattern: `autoWrapEndpoints.ts:84-93`), surfaced reactively (a `useReadContract`
  `erc20Abi.allowance`) so the button disappears once approved.

### E. Chip UI — fully polished (`ClearMacroRelayOption.tsx` + a payment sub-component)
- `src/features/clearMacro/useRelayFee.ts`: extend `RelayFeeDisclosure` to also return the raw `feeToken`
  address, `maxFeeWei` (`baseFee × maxTxMultiplier(actionKind)` — the existing upper-bound used for
  `feeText`), `underlyingAddress`, `underlyingDecimals`, and `requiredUsdcWei` (`feeToUnderlyingUnitsCeil`).
  Resolve underlying via `findTokenFromTokenList` (already imported).
- New `src/features/clearMacro/useClearMacroUsdcFeePayment.ts`: encapsulates everything the selector needs —
  permit2 capability (`useRelayCapabilities()` = a react-query `useQuery` around module-cached
  `getCapabilities`, gated with `chainSupportsPermit2`), USDCx `availableBalance`
  (`rpcApi.useRealtimeBalanceOfNowQuery` — matches the executor's exact read), USDC balance
  (`rpcApi.useUnderlyingBalanceQuery`), Permit2 allowance (`useReadContract` `erc20Abi.allowance`), the
  current `clearMacroPaymentMode` + `applySettings` setter, and derived flags `{ usdcxShortfall, canPayWithUsdc
  (capability && underlying resolves), needsApproval, usdcInsufficient }`.
- `ClearMacroRelayOption.tsx`: when relay enabled + fee available + `canPayWithUsdc`, render a payment-method
  selector below the "Fee:" line — two options **USDCx** / **USDC**, each showing the balance, USDCx tagged
  "insufficient" on shortfall, USDC the natural pick when short (writes `clearMacroPaymentMode`). When USDC is
  selected and `needsApproval`, render an inline one-time **"Approve USDC"** `TransactionButton` (wrapped in
  `TransactionBoundary`, driven by `useApproveUsdcForPermit2`); hide once the allowance read clears. When
  `usdcInsufficient`, show a "Not enough USDC" hint. Update the tooltip: the USDC path is still one signature
  (Permit2) plus a one-time approval. All existing render sites (`SendTransfer.tsx`, `SendStream.tsx`,
  `TabWrap.tsx`, `TabUnwrap.tsx`, `SaveButton.tsx`) already pass `actionKind`/`network` — no change there.
  This also folds in Phase 1's deferred readiness affordance (§7): the shortfall state now offers "Pay with
  USDC" instead of silently relying on the executor gate.

### F. Guardrails (non-negotiable — verify each in review)
- Permit sized against **`maxFee`**, not `currentFee`.
- One-time `USDC.approve(Permit2)` is a **self-pay** write with **no `clearMacro` tag**; there is no separate
  prep wrap (the forwarder wraps JIT).
- **One signature per mode** — Permit2 witness sig replaces the ClearMacro sig; never both.
- **Never fall back after the Permit2 signature.** Pre-signature assembly misses → `ClearMacroNotEligibleError`
  (safe self-pay, `console.warn(cause)`); fee/approval shortfalls → surface (`ClearMacroInsufficientFeeError` /
  `ClearMacroPermit2ApprovalRequiredError`), Sentry-skipped.
- `maxFee` (18-dec) → underlying units via the token list's **real decimals, rounding up** (never hardcode 6).
- Every macro fee read stays `.catch`-tolerant of the old feeless deployment.

### G. Reuse map (do not reinvent)
| Need | Reuse | Path |
|---|---|---|
| ERC-20 allowance read | `getErc20Allowance` | `src/features/transactions/contractReads.ts:39` |
| Fee-token → underlying + decimals | `findTokenFromTokenList` (2 lookups; `underlyingAddress`, then `decimals`) | `src/hooks/useTokenQuery.tsx:81` |
| Parse EIP-712 type defs | `parseEIP712TypeDef` | `src/features/clearMacro/dashboardClearMacro.ts:158` |
| Action field values (incl. `token` alias) | `resolveActionFieldValue`, `getActionCallInfo` | `dashboardClearMacro.ts:142` / `:42` |
| Self-pay ERC-20 approve shape | `useTokenApprove` | `src/features/tokenWrapping/useTokenWrapWrites.ts:21` |
| USDCx available balance | `rpcApi.useRealtimeBalanceOfNowQuery` | `src/features/redux/endpoints/adHocRpcEndpoints.ts:177` |
| USDC balance | `rpcApi.useUnderlyingBalanceQuery` | `adHocRpcEndpoints.ts:85` |
| On-chain-verified sign pattern | the `getDigest`/`hashTypedData` block | `executeClearMacro.ts:286` |
| Witness struct-hash cross-check | `hashStruct` (viem) vs `getPermit2WitnessStructHash` | viem / SDK forwarder ABI |

### H. Deploy the fee macro to OP Sepolia (unblocks E2E — repo owner runs this)
The earlier deploy was **feeless** (no fee env vars). For Phase 2 add `FEE_SUPER_TOKEN` / `BASE_FEE_AMOUNT` /
`FEE_RECEIVER`. Resolved OP Sepolia constants: host `0xd399e2Fb5f4cf3722a11F65b88FAB6B2B8621005`, FlowScheduler
`0x73B1Ce21d03ad389C2A291B1d1dc4DAFE7B5Dc68`, fee token `fUSDCx` `0x131780640edf9830099aac2203229073d6d2fe69`
(underlying `fUSDC` `0x2eaa49beb4aa4fcc709dc14c0fa0ff1b292077b5`, **18 decimals on this testnet** — so OP
Sepolia won't exercise the sub-18-dec path, but the assembly/signature is fully exercised).

```bash
SUPERFLUID_HOST=0xd399e2Fb5f4cf3722a11F65b88FAB6B2B8621005 \
FLOW_SCHEDULER=0x73B1Ce21d03ad389C2A291B1d1dc4DAFE7B5Dc68 \
FEE_SUPER_TOKEN=0x131780640edf9830099aac2203229073d6d2fe69 \
BASE_FEE_AMOUNT=10000000000000000 \
FEE_RECEIVER=0x7269B0c7C831598465a9EB17F6c5a03331353dAF \
forge script contracts/script/DeployDashboardClearMacro.s.sol --root contracts \
  --rpc-url https://sepolia.optimism.io \
  --account hacked_dev --sender 0x7269B0c7C831598465a9EB17F6c5a03331353dAF \
  --broadcast \
  --verify --verifier blockscout \
  --verifier-url https://optimism-sepolia.blockscout.com/api/
```
`BASE_FEE_AMOUNT` = 0.01 fUSDCx (must remain a multiple of `1e13`; adjust freely). `FEE_RECEIVER` shown as the
deployer/sender — change if a different receiver is wanted.

**Deployed 2026-07-07 (OP Sepolia):** the 5-arg fee macro is live at
**`0x576d1274Ef1E4e1f6093ffC1188c8D32411dDD65`** (fee token fUSDCx `0x131780640…D6D2FE69`, base fee
`10000000000000000` = 0.01, fee receiver `0x7269B0c7C831598465a9EB17F6c5a03331353dAF`). **The implementing
session must set** `networks.ts` `optimismSepolia.dashboardClearMacro.macroAddress` to this address (replacing
the old feeless `0xa7AA0ff…`) and refresh the stale deployed-instance comment in `dashboardClearMacro.ts`.
**No ABI regen** — the generated ABI already matches the 5-arg fee macro.

**Blockscout verification is cosmetic and does NOT block deploy or the dashboard integration.** The
`--verify` step can fail with a redirect the forge CLI doesn't follow (the blockscout API 3xx-redirects
`/api/`); the contract is still deployed and usable — grab its address from
`contracts/broadcast/DeployDashboardClearMacro.s.sol/11155420/run-latest.json` (or the console `deployed at`
line). Retry verification **standalone** (no re-deploy) with the exact constructor args:
```bash
forge verify-contract 0x576d1274Ef1E4e1f6093ffC1188c8D32411dDD65 \
  src/DashboardClearMacro.sol:DashboardClearMacro --root contracts --chain 11155420 \
  --verifier blockscout --verifier-url https://optimism-sepolia.blockscout.com/api \
  --constructor-args $(cast abi-encode \
    "constructor(address,address,address,uint256,address)" \
    0xd399e2Fb5f4cf3722a11F65b88FAB6B2B8621005 0x73B1Ce21d03ad389C2A291B1d1dc4DAFE7B5Dc68 \
    0x131780640edf9830099aac2203229073d6d2fe69 10000000000000000 \
    0x7269B0c7C831598465a9EB17F6c5a03331353dAF) \
  --watch
```
The redirect workaround is the `--verifier-url` **without a trailing slash** (`…/api`, not `…/api/`); if it
still 3xx-loops, try the v2 endpoint `…/api/v2` or just skip verification (not required for E2E). Two other
`verify-contract` gotchas: the contract path is **root-relative** (`src/…`, since `--root contracts` roots the
project — `contracts/src/…` doubles to `contracts/contracts/src/…`), and pass `--chain 11155420` so it doesn't
default to labeling the target "mainnet".

### I. Verification / acceptance
1. **`pnpm typecheck`** — clean (primary gate; E2E is deploy-gated).
2. **`forge test` in `contracts/`** — 44/44 unchanged (no contract change this phase; confirms no regression).
3. **Assembly proof (survives the deploy blocker):** a throwaway node script that, against the deployed macro
   with **real** fUSDCx/fUSDC addresses, reads `getPermit2WitnessTypeString`/`getPermit2WitnessStructHash`,
   builds the typed data exactly as B2 does, and asserts local `hashStruct(witness)` === on-chain struct hash.
4. **`pnpm lint`** on changed files.
5. **Codex review** of the full diff via Pal MCP `clink` before landing (established pattern).
6. **After the owner deploys + repoints `macroAddress`** (browser MCP): signer holding **only fUSDC** (zero
   fUSDCx) + the one-time Permit2 approval done → drive a relayable action with "Pay with USDC" → confirm
   **one** signature, a `clearMacroPermit2V1` POST in the network tab, fUSDCx minted JIT, fee to the receiver,
   action executed. Re-confirm the usdcx-direct path is unchanged.

### J. Open risks / notes
- **Struct-hash read reverts on fake tokens** — only ever call `getPermit2WitnessStructHash` with real token
  addresses (it recomputes the on-chain description). The executor path always has real tokens; only the
  throwaway verification script must use testnet tokens.
- **Fallback simulation in permit2 mode** validates the *action* (fee-independent), so it stays shared. For a
  USDCx-denominated action it still requires the user hold that token — pay-with-USDC funds only the fee, not
  the action.
- **Sticky mode**: `clearMacroPaymentMode` persists globally; acceptable because the chip always shows and can
  flip the active mode. If a cleaner per-attempt UX is later wanted, swap the persisted setting for a small
  `ClearMacroPaymentContext` (the only other decoupled channel; more plumbing).
- **`ClearMacroPermit2ApprovalRequiredError`** should be rare (the chip approves proactively); it's the
  belt-and-suspenders for an allowance race and surfaces a clear "approve first" message.

---

## 10. Phase 2 implementation record (2026-07-07)

Implemented per §9, in one pass. Files: `permit2.ts` (new), `useApproveUsdcForPermit2.ts` (new),
`useClearMacroUsdcFeePayment.ts` (new, incl. `useRelayCapabilities`), `executeClearMacro.ts`
(shared `buildActionSecurityMessages` + `readRelayFeeQuote` + `usdc-permit2` branch +
`ClearMacroPermit2ApprovalRequiredError`), `relayApi.ts` (`chainSupportsPermit2`), `useRelayFee.ts`
(underlying resolution on `RelayFeeDisclosure`), `ClearMacroRelayOption.tsx` (payment selector +
inline approve), `appSettings.slice.tsx`/`appSettingsHooks.tsx` (`clearMacroPaymentMode`,
type-only import), `useSuperfluidWriteContract.ts` (mode plumbing + error handling),
`networks.ts` + `dashboardClearMacro.ts` (macro repoint).

### Deliberate deviations from the §9 handoff (both from Codex review findings)
1. **Same-underlying upgrade adjustment (new guard, HIGH finding).** In `usdc-permit2` mode, an
   `upgrade` of the fee token pulls its wrap amount from the SAME underlying (USDC) balance the
   fee permit draws from — the forwarder pulls the fee first, then the macro's upgrade — so the
   underlying balance guard requires `feeToUnderlyingUnitsCeil(maxFee) +
   feeToUnderlyingUnitsCeil(action.amount)` for that case. The Permit2 permit itself stays sized
   to the fee only. (The chip's `usdcInsufficient` flag does NOT mirror the adjustment — it has
   no action amount; the executor guard surfaces it pre-signature.)
2. **Stale-mode degrade, not self-pay (MEDIUM finding).** §9-B2's capability gate threw
   `ClearMacroNotEligibleError` (silent self-pay). Instead, a `usdc-permit2` selection that can't
   be honored — no `clearMacroPermit2V1` capability on the chain, feeless macro, or unresolvable
   ERC-20 underlying — **degrades to the usdcx-direct RELAY** (`effectivePaymentMode`,
   `permit2Funding` up-front resolution): still gasless, and the post-assembly USDCx guard is
   keyed on the assembled `typedData` (not the requested mode) so the degraded path stays guarded.
3. **Executor allowance/balance reads use the injected `wagmiConfig`** (plain `readContract`
   with `erc20Abi`) rather than `getErc20Allowance` from `contractReads.ts` (which binds the
   global config) — consistency with every other read in the executor; behavior identical.
4. `RelayFeeDisclosure.requiredUnderlyingWei` is the field name (handoff sketch said
   `requiredUsdcWei`) — nothing in it is USDC-specific.

### Verification status
- `pnpm typecheck` ✅; `forge test` 44/44 ✅ (no contract change). Lint: `pnpm lint` (next lint)
  reports nothing in the changed files — its errors are all pre-existing vendored
  `contracts/lib/…` code. NOTE: direct `pnpm exec eslint <file>` invocations are IGNORED by the
  current flat config ("no matching configuration"), so `pnpm lint` is the only meaningful lint
  gate for `src/`.
- **Assembly proof ✅ (§I.3):** throwaway script against the DEPLOYED macro/forwarder on OP
  Sepolia with real fUSDCx — local viem `hashStruct(witness)` === on-chain
  `getPermit2WitnessStructHash` (exact match, transfer action).
- **Codex review ✅ ×3** (Pal `clink`): (1) full-diff review → the two §10-deviation findings
  above; (2) fix verification → both confirmed, no new issues; (3) independent final pass →
  no critical/high; two mediums + two nits, all addressed: the chip's allowance refetch is now
  **receipt-driven** (`useWaitForTransactionReceipt` on the approve hash, not the submission
  promise), a persisted `usdc-permit2` stays **visible (disabled) while capabilities load**
  (`isCapabilitiesPending` — the executor could already honor it, so the chip must not hide the
  active mode), `buildPermit2Types` spread order makes the fixed outer type win + the executor
  degrades on a reserved-name witness collision, and this lint wording was corrected.
- **Browser E2E (§I.6) NOT yet run** — needs a signer holding only fUSDC (zero fUSDCx) in the
  live app: one-time approve → relayable action with "Pay with USDC" → ONE signature,
  `clearMacroPermit2V1` POST, JIT wrap, fee to receiver, action executed; re-confirm
  usdcx-direct unchanged.

---

## 11. Future direction (under consideration, 2026-07-07): drop the scheduling allowlist

Idea from the repo owner: stream scheduling is currently gated by the Platform allowlist
(`useWhitelist` → `platformApi.useIsAccountWhitelistedQuery`; UI gate in `SendStream.tsx` around
the scheduling section, testnets bypass). The relay fee's schedule multiplier (2×/3× — it prices
the keeper executions) could replace that gate entirely: make scheduling **Clear Macro–only with
the fee mandatory** and remove the allowlist. Known implications, none solved yet:

- **Executor contract change:** `ClearMacroNotEligibleError`'s silent self-pay fallback must be
  disabled for schedule-carrying writes (a self-paid schedule creates an unpaid keeper
  obligation) — e.g. a `clearMacroRequired` flag that surfaces instead of falling back.
- **Enforcement can't close in the dashboard:** `FlowScheduler` is permissionless, so a direct
  `createFlowSchedule` bypasses the fee and looks identical to the keeper. Needs keeper-side
  filtering to macro-created (fee-paid) schedules, or a protocol-level fee.
- **Smart wallets are excluded** by the macro's `isEOA === true` gate — they'd need a retained
  allowlist path or an ERC-1271-capable macro variant.
- §6's "modify is always 1×, not gameable" rationale should be re-examined without the allowlist.
- Fee-receiver ↔ keeper gas economics become one loop that must actually be funded/operated.
- Vesting and auto-wrap have separate whitelist surfaces — out of scope for this idea as stated.
