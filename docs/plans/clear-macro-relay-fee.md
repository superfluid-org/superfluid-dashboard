# Clear Macro relay fee — implementation record + Phase 2 handoff

This is the working document for adding a relay **fee** to the Clear Macro path and letting users
**pay it in USDCx or USDC**. Phase 0 (contract) and Phase 1 (USDCx-direct UI) are **done**; Phase 2
(pay-with-USDC via Permit2) is **designed and ready to build** and is the main subject of the handoff
below. It complements [`clear-macro-relay-integration.md`](./clear-macro-relay-integration.md) (the base
relay integration) — read that first for the overall relay architecture.

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

### Deployment prerequisite (BLOCKS end-to-end verification of Phase 1 AND Phase 2)
The deployed OP Sepolia macro (`networks.ts` `dashboardClearMacro.macroAddress = 0xa7AA0ff…`) is the OLD
2-arg **feeless** macro. Deploy the new 5-arg fee macro (`DeployDashboardClearMacro.s.sol`, with
`FEE_SUPER_TOKEN` = a testnet USDCx, `BASE_FEE_AMOUNT` a multiple of `1e13`, `FEE_RECEIVER`) and update
`macroAddress`. Until then the app runs feeless (the tolerant reads keep it working, no fee line). Also
update the stale deployed-instance comment in `src/features/clearMacro/dashboardClearMacro.ts`.

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
  it (reuse `parseEIP712TypeDef`).
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

## 6. Design decisions & gotchas (from two Codex reviews — honor these)
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

## 7. Deferred from Phase 1 (pick up in/with Phase 2)
- Chip **readiness affordance** ("Add USDCx" / disable when insufficient) — Phase 1 relies on the executor
  gate; fold the affordance into the Phase 2 payment selector.
- Chip **schedule fee label** shows "up to 3×" for all scheduling (a start/stop-only new schedule is only
  2×) — conservative; exact needs the full action params via `previewRelayFee`.
- Deploy the fee macro + update `networks.ts` + the stale ABI-module comment.

## 8. Verification (Phase 2)
`pnpm typecheck`; then against a deployed fee macro on OP Sepolia: with a signer holding **only USDC**
(zero USDCx) and a one-time Permit2 approval done, drive a relayable action with "Pay with USDC" — confirm
one signature, `clearMacroPermit2V1` submission, USDCx minted just-in-time, fee paid to the receiver, and
the action executed. Use the browser MCP tools. Re-confirm the usdcx-direct path still works unchanged.
