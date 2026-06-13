# Plan: Dashboard Clear Macro integration — relay-only, with fallback to the current write path

> Handover document for an implementing agent. Self-contained: all contract/API facts below were
> verified against live sources on 2026-06-11 (how, is noted inline). Read **Codebase orientation**
> first if you are new to this repo.

## Context — why this change

The Dashboard's write path was just migrated off sdk-core/ethers-v5 onto a shared wagmi/viem
executor (see `docs/plans/write-path-migration-sfpro-viem.md`, implemented on branch
`2026-06-10-maintenance`). That migration deliberately kept transaction tracking
**hash-source-agnostic** to prepare for this step: executing Dashboard transactions through the
**Clear Macro** system.

Clear Macro = the user signs **one human-readable EIP-712 typed-data message** (clear signing, no
raw calldata in the wallet); a relay provider submits the transaction via
`ClearMacroForwarder.runMacro`, pays the gas, and recovers cost from the signer's Super Token
balance (gasless for the user).

**Confirmed product decisions (from the repo owner):**
1. **Relay-only.** No self-submit mode. The user's wallet only ever produces an EIP-712 signature;
   the relay provider (`macros.superfluid.eth`, `https://clearmacro-provider.superfluid.dev`)
   broadcasts the transaction.
2. **All 7 macro actions** are in scope (mapping below).
3. **Settings-page toggle**, persisted, **default ON**. Plus automatic fallback: wherever the macro
   path is not configured / not eligible / fails *before* the user signs, the current write
   implementation runs unchanged.

The macro is deployed on **Optimism Sepolia only**:
`DashboardClearMacro` at `0x77232a2a953b570D1fEE1FE16b1902299fe7b898`
(<https://sepolia-optimism.etherscan.io/address/0x77232a2a953b570d1fee1fe16b1902299fe7b898>).
All other networks always use the fallback path.

## Verified facts

### DashboardClearMacro (the macro contract)

A multi-action macro built on `ClearMacroBase` (see the Superfluid skill reference
`references/guides/clear-macro.md` in <https://github.com/superfluid-org/skills>). One **action per
signed payload**. The contract is **not verified** on Blockscout and its ABI is **not** shipped in
`@sfpro/sdk` — embed the ABI below in the Dashboard (`src/features/clearMacro/dashboardClearMacro.ts`).

**Authoritative ABI** (provided by the repo owner; independently cross-checked this session against
the `PUSH4` selector table extracted from the deployed runtime bytecode — every function matches):

```json
[{"inputs":[{"internalType":"contract ISuperfluid","name":"host","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"InvalidPeriod","type":"error"},{"inputs":[{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"uint256","name":"length","type":"uint256"}],"name":"StringsInsufficientHexLength","type":"error"},{"inputs":[{"internalType":"uint8","name":"actionId","type":"uint8"}],"name":"UnknownActionId","type":"error"},{"inputs":[],"name":"UnsupportedLanguage","type":"error"},{"inputs":[{"internalType":"contract ISuperfluid","name":"host","type":"address"},{"internalType":"bytes","name":"actionParams","type":"bytes"},{"internalType":"address","name":"account","type":"address"}],"name":"buildBatchOperations","outputs":[{"components":[{"internalType":"uint32","name":"operationType","type":"uint32"},{"internalType":"address","name":"target","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"internalType":"struct ISuperfluid.Operation[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct DashboardClearMacro.ApproveParams","name":"p","type":"tuple"}],"name":"describeApprove","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"int96","name":"flowRate","type":"int96"}],"internalType":"struct DashboardClearMacro.CreateFlowParams","name":"p","type":"tuple"}],"name":"describeCreateFlow","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"receiver","type":"address"}],"internalType":"struct DashboardClearMacro.DeleteFlowParams","name":"p","type":"tuple"}],"name":"describeDeleteFlow","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct DashboardClearMacro.DowngradeParams","name":"p","type":"tuple"}],"name":"describeDowngrade","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct DashboardClearMacro.TransferParams","name":"p","type":"tuple"}],"name":"describeTransfer","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"int96","name":"flowRate","type":"int96"}],"internalType":"struct DashboardClearMacro.UpdateFlowParams","name":"p","type":"tuple"}],"name":"describeUpdateFlow","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct DashboardClearMacro.UpgradeParams","name":"p","type":"tuple"}],"name":"describeUpgrade","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct DashboardClearMacro.ApproveParams","name":"p","type":"tuple"}],"name":"encodeApprove","outputs":[{"internalType":"bytes","name":"actionParams","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"int96","name":"flowRate","type":"int96"}],"internalType":"struct DashboardClearMacro.CreateFlowParams","name":"p","type":"tuple"}],"name":"encodeCreateFlow","outputs":[{"internalType":"bytes","name":"actionParams","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"receiver","type":"address"}],"internalType":"struct DashboardClearMacro.DeleteFlowParams","name":"p","type":"tuple"}],"name":"encodeDeleteFlow","outputs":[{"internalType":"bytes","name":"actionParams","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct DashboardClearMacro.DowngradeParams","name":"p","type":"tuple"}],"name":"encodeDowngrade","outputs":[{"internalType":"bytes","name":"actionParams","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct DashboardClearMacro.TransferParams","name":"p","type":"tuple"}],"name":"encodeTransfer","outputs":[{"internalType":"bytes","name":"actionParams","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"address","name":"receiver","type":"address"},{"internalType":"int96","name":"flowRate","type":"int96"}],"internalType":"struct DashboardClearMacro.UpdateFlowParams","name":"p","type":"tuple"}],"name":"encodeUpdateFlow","outputs":[{"internalType":"bytes","name":"actionParams","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes32","name":"lang","type":"bytes32"},{"components":[{"internalType":"contract ISuperToken","name":"superToken","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"internalType":"struct DashboardClearMacro.UpgradeParams","name":"p","type":"tuple"}],"name":"encodeUpgrade","outputs":[{"internalType":"bytes","name":"actionParams","type":"bytes"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes","name":"actionParams","type":"bytes"}],"name":"getActionStructHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"encodedPayload","type":"bytes"}],"name":"getActionTypeDefinition","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"encodedPayload","type":"bytes"}],"name":"getPrimaryTypeName","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"contract ISuperfluid","name":"host","type":"address"},{"internalType":"bytes","name":"actionParams","type":"bytes"},{"internalType":"address","name":"account","type":"address"}],"name":"postCheck","outputs":[],"stateMutability":"view","type":"function"}]
```

Summary: 7 actions, each with `encode<Action>(bytes32 lang, <Params> p) → bytes actionParams`
(`pure`) and `describe<Action>(bytes32 lang, <Params> p) → string` (`view`). Param tuples
(field names confirmed by the ABI): `Approve(superToken, spender, amount)`,
`Transfer(superToken, receiver, amount)`, `Upgrade(superToken, amount)`,
`Downgrade(superToken, amount)`, `CreateFlow(superToken, receiver, flowRate int96)`,
`UpdateFlow(superToken, receiver, flowRate int96)`, `DeleteFlow(superToken, sender, receiver)`.
Plus IClearMacro (`getPrimaryTypeName`/`getActionTypeDefinition`/`getActionStructHash`) and IMacro
(`buildBatchOperations`/`postCheck` — not called by the Dashboard). Macro-specific errors:
`UnknownActionId(uint8)`, `UnsupportedLanguage()`, `InvalidPeriod()`,
`StringsInsufficientHexLength(uint256,uint256)`.

Note the tuple field names are NOT automatically the EIP-712 `Action` field names — the message
fields still come from `getActionTypeDefinition` at runtime (see "EIP-712 assembly" below), though
they are now expected to match (`description` + the tuple fields).

`lang` is `bytes32("en")`: `stringToHex("en", { size: 32 })` in viem.

**Reference test** — `sdk/package/tests/clear-macro-forwarder.live.test.ts` in
<https://github.com/superfluid-org/superfluid.pro> exercises this exact deployment end-to-end
(action encode → `encodeParams` → `getDigest` → sign → simulate `runMacro`). Use it as the parity
reference, with two caveats for the Dashboard integration:
- It signs the raw **digest** (`account.sign({ hash: digest })`) — fine for a test's private-key
  account, but the Dashboard MUST use `signTypedData` so the wallet renders the readable prompt.
- It uses `SELF_PROVIDER` + self-submit; the Dashboard uses the relay provider's identity in
  `security.domain`/`security.provider` instead.
- Useful detail it documents: `@sfpro/sdk`'s `clearMacroForwarderAbi` is augmented with the
  protocol-wide error codes (`allErrors`), so reverts originating in other contracts (e.g.
  `SF_TOKEN_MOVE_INSUFFICIENT_BALANCE` from the Super Token) decode when simulating/inspecting
  `runMacro` failures.

### ClearMacroForwarder

Shipped in `@sfpro/sdk@0.2.1` (already installed): `clearMacroForwarderAbi`,
`clearMacroForwarderAddress` from `@sfpro/sdk/abi`. Deterministic address
`0xC1EaB73855155D4e021f7EB4f866996Bac2fe25e` (same on OP Sepolia — but always resolve via
`clearMacroForwarderAddress[chainId]`). Reads used by this integration:

- `getNonce(address account, uint256 key)` → `uint256` — use `key = 0n` (simple sequential).
- `encodeParams(bytes actionParams, (string domain, address macroContract, string provider, uint256 validAfter, uint256 validBefore, uint256 nonce) security)` → `bytes encodedPayload`
- `getTypeDefinition(address m, bytes encodedPayload)` → `string` — full EIP-712 type definition
  (concatenated `TypeName(...)` tokens, no separators).
- `eip712Domain()` → standard ERC-5267 tuple; domain is `("ClearMacro", "1", chainId, forwarder)` —
  read it, don't hardcode.

### Relay provider API

Base `https://clearmacro-provider.superfluid.dev`. OpenAPI (authoritative, re-check at
implementation time): `GET /docs/json`. Verified live on 2026-06-11:

- `GET /v1/capabilities` → `{ providerName: "macros.superfluid.eth", chains: [{ chainId, forwarderAddress, macroPolicy }] }`.
  **Chain 11155420 (OP Sepolia) is present with `macroPolicy.mode: "open"`** (no macro allowlist).
- `POST /v1/relay-executions` — body (required): `kind: "clearMacroV1"`, `chainId`, `macroAddress`,
  `signerAddress`, `payload` (the `encodedPayload` hex), `signature`. Optional: `value`,
  `clientRequestId` (dapp correlation id, echoed back), `metadata` (free-form),
  `forceExecuteAfterPreflightRevert`. Per the schema, `signature` is "over
  `ClearMacroForwarderV1.getDigest(m, encodedPayload)`" — a correct `signTypedData` signature
  equals exactly that digest's signature. EOAs and ERC-1271 signers are accepted.
  Returns the execution resource (`200`/`202`); errors are
  `{ error: { code, message, category, retryable, executionId, details } }` with codes like
  `INVALID_CLEAR_MACRO_PAYLOAD`, `SIGNATURE_INVALID`, `PREFLIGHT_REVERTED`, `CHAIN_NOT_ALLOWED`,
  `RELAYER_UNAVAILABLE`.
- `GET /v1/relay-executions/{id}` — execution resource:
  `state: "pending" | "submitted" | "succeeded" | "reverted" | "rejected" | "failed" | "expired" | "canceled"`
  (`terminal: boolean` provided). Hash availability follows the state: `pending` = accepted, **no
  transaction hash exists yet**; `submitted` = `transaction.hash` present but it is the *current*
  hash and **may change before terminal** (relayer replacements); terminal `succeeded` =
  `receipt.transactionHash` + `receipt.status` are final. The API's `id` description says it
  directly: "Dapps should track this ID rather than the EVM transaction hash" — the Dashboard's
  hash-keyed tracker can't, hence poll-to-terminal (see executor section). Also: `nonce`,
  `validity`, `timestamps`, `links.self`.

### EIP-712 assembly — the two critical gotchas

(Reference: `references/guides/clear-macro.md` in the superfluid-org/skills repo; read it in full
before implementing.)

1. **`message.action` holds the DECODED flat fields, not the wire bytes.** The macro's Action type
   is flat and macro-specific, e.g. `Action(string description,address superToken,address
   receiver,int96 flowRate)` — never `Action(bytes params)`. Parse `getTypeDefinition`'s output
   into a viem `types` object and populate `message.action` field-by-field **by parsed field
   name**. If a parsed field name has no known value, abort to fallback — a wrong message shape
   produces `InvalidSignature` on-chain / `SIGNATURE_INVALID` from the relay.
2. **`description` is computed on-chain.** It is bound into the signed digest. Read it back via the
   matching `describe<Action>(lang, tuple)` view and place it verbatim in `message.action.description`.

Type-definition parser (port as-is; from the skill guide):

```ts
function parseEIP712TypeDef(typeDef: string) {
  const types: Record<string, { type: string; name: string }[]> = {};
  const re = /([A-Z]\w*)\(([^)]*)\)/g;
  let m;
  while ((m = re.exec(typeDef)) !== null) {
    const [, typeName, fields] = m;
    types[typeName] = fields === "" ? [] : fields.split(",").map((f) => {
      const parts = f.trim().split(" ");
      return { type: parts[0], name: parts[1] };
    });
  }
  return types;
}
```

`primaryType` comes from the macro's `getPrimaryTypeName(encodedPayload)`.

## Codebase orientation (state as of branch `2026-06-10-maintenance`)

- **Shared write executor** — `src/features/transactions/useSuperfluidWriteContract.ts`. One
  TanStack `useMutation` spans each write: args-builder (preflight reads run inside the mutation) →
  resolve fee overrides (gas API; `gas: 0n` is the smart-wallet sentinel → skip simulation, omit
  gas) → optional `simulateContract` → `writeContract` → `dispatch(trackTransaction)`. Feature
  hooks return `[trigger, result]` (RTK-mutation-shaped `result` consumed by `TransactionBoundary`).
- **SubOperation layer** — `src/features/transactions/operations.ts`. Each op carries its Host
  `batchCall` encoding AND a `direct` standalone write fragment; a lone op executes directly
  (since commit `a1889486`, lone CFA ops use CFAv1Forwarder), >1 ops batch via Host `batchCall`.
  **This integration mirrors that exact pattern** with a `clearMacro` descriptor.
- **Tracking** — `src/features/transactions/trackTransaction.ts`: needs only
  `{ hash, chainId, signerAddress, title, extraData?, pendingUpdates? }`. Pending updates are
  hash-keyed; any on-chain hash works, including one produced by a relayer.
- **Network config** — `src/features/network/networks.ts`; optional capability fields on `Network`
  (e.g. `autoWrap?`, `flowSchedulerContractAddress?`); `optimismSepolia` is defined around line
  923 (`chainId 11155420`, slug `opsepolia`).
- **Settings** — `src/features/settings/appSettings.slice.tsx` (`AppSettingsState`,
  `applySettings` merges partials) + `useSetting` in `appSettingsHooks.tsx`; page at
  `src/pages/settings.tsx` (a `Stack` ready for new sections). Verify redux-persist coverage for
  the new key in `src/features/redux/store.ts` (follow the existing migrations pattern only if
  required for new keys).
- **Conventions:** never hand-roll loading/error state (the executor's mutation owns the
  lifecycle); native `bigint` everywhere on the write path; ABIs from `@sfpro/sdk` where available;
  preflight failures must surface through the mutation `result` (throw inside builders/executor).

## Work plan

### 1. New `src/features/clearMacro/`

**`dashboardClearMacro.ts`** — the hand-written macro ABI (14 encode/describe helpers +
`getPrimaryTypeName` + `getActionTypeDefinition`; validate against the selector table above) and
the action model:

```ts
export type ClearMacroAction =
  | { kind: "approve"; superToken: Address; spender: Address; amount: bigint }
  | { kind: "transfer"; superToken: Address; receiver: Address; amount: bigint }
  | { kind: "upgrade"; superToken: Address; amount: bigint }
  | { kind: "downgrade"; superToken: Address; amount: bigint }
  | { kind: "createFlow"; superToken: Address; receiver: Address; flowRate: bigint }
  | { kind: "updateFlow"; superToken: Address; receiver: Address; flowRate: bigint }
  | { kind: "deleteFlow"; superToken: Address; sender: Address; receiver: Address };
```

plus a per-kind map → `{ encodeFunctionName, describeFunctionName, tuple(action) }` and a
field-name→value resolver used when populating `message.action` from the parsed type definition.

**`relayApi.ts`** — fetch client for the provider API: `getCapabilities()` (module-cached),
`createRelayExecution(body)`, `pollRelayExecutionUntilTerminal(id)` (~2s interval, ~2 min cap; on
`reverted|rejected|failed|expired|canceled` throw an `Error` carrying the API error/state message
so the transaction dialog displays it).

**`executeClearMacro.ts`** — one async function (not a hook), `(wagmiConfig, { chainId,
signerAddress, action, macroAddress }) → Promise<{ hash, executionId }>`:

1. Eligibility reads: **`clearMacroForwarderAddress[chainId]` must exist** (no forwarder deployed
   for the network → the feature is disabled for that network entirely) AND capabilities must list
   `chainId`. Any miss → throw `ClearMacroNotEligibleError`.
2. On-chain reads (`@wagmi/core readContract`): `getNonce(signer, 0n)`; macro
   `encode<Action>(lang, tuple)` → `actionParams`; `security = { domain: providerName,
   macroContract: macroAddress, provider: providerName, validAfter: 0n, validBefore: now + 600s,
   nonce }`; forwarder `encodeParams` → `encodedPayload`; forwarder `getTypeDefinition`; macro
   `getPrimaryTypeName`; macro `describe<Action>` → `description`; forwarder `eip712Domain()`.
3. Assemble `types` (`parseEIP712TypeDef`) + `message = { action: { description, ...fields },
   security }` (fields mapped by parsed name; unknown field → `ClearMacroNotEligibleError`).
4. **Pre-signature simulation** (preserves the current simulate-before-prompt UX; `runMacro`
   itself cannot be usefully simulated yet — its signature check precedes the batch operations, so
   a dummy signature reverts `InvalidSignature` before testing anything real). Simulate the
   **fallback `direct` fragment** the write args already carry (catches insufficient balance,
   duplicate stream, etc.). A revert here → throw the decoded error (surfaces in the dialog,
   matching today's `simulate: true` behavior). More faithful alternative if needed later: read
   `macro.buildBatchOperations(host, actionParams, signer)` (a `view`) and simulate
   `host.batchCall(ops)` with `account = signer` — near-exact semantics since the forwarder
   forwards those ops with the signer as EIP-2771 sender.
5. `signTypedData` (`@wagmi/core`). **After this point, never fall back** — surface errors (the
   user has signed or rejected; a silent second wallet prompt would be confusing).
6. **Post-signature simulation**: simulate `runMacro(macro, encodedPayload, signer, signature)`
   with the real signature before POSTing — a free local sanity check; the SDK's
   `clearMacroForwarderAbi` decodes protocol-wide errors (e.g.
   `SF_TOKEN_MOVE_INSUFFICIENT_BALANCE`) for good messages.
7. `POST /v1/relay-executions` (`metadata: { source: "dashboard" }`, optionally a
   `clientRequestId`); poll until terminal; on `succeeded` return `receipt.transactionHash`.
   **Why track only at terminal:** the sdk-redux transaction tracker is keyed by hash with no
   hash-update mechanism, and pending updates are hash-derived; the pre-terminal
   `transaction.hash` is documented as replaceable. Tracking the final receipt hash means the
   tracker immediately finds the tx confirmed — the drawer's "pending" phase is mostly skipped and
   the dialog resolves at confirmation, which is the accepted trade-off (fast on OP Sepolia).

### 2. Executor hook-in — `useSuperfluidWriteContract.ts`

- `SuperfluidWriteArgs` gains `clearMacro?: ClearMacroAction`.
- In `mutationFn` after the builder + overrides resolution: if `params.clearMacro` && network has
  `dashboardClearMacro` && `clearMacroForwarderAddress[chainId]` exists (no forwarder on the
  network = feature disabled there) && setting enabled && `!isSmartWallet` →
  `try executeClearMacro(...)`;
  catch `ClearMacroNotEligibleError` (and any pre-signature error it wraps) → `console.warn` + fall
  through to the existing simulate/`writeContract` path. On success → same
  `dispatch(trackTransaction(...))` with the **original `title`**, `getPendingUpdates(hash)`, and
  `extraData: { ...params.extraData, clearMacroExecutionId }`; return `{ hash, chainId }`.
- Read the setting via `useSetting("clearMacroEnabled")` at hook level, close over it in the
  mutation. Fee overrides/gas do not apply on the macro path (provider pays).
- Note: with relay, the mutation resolves only at relay-terminal (post-confirmation) — the dialog
  shows its loading state slightly longer than a plain wallet submit. Acceptable on OP Sepolia.

### 3. Network config

`Network` type: add `dashboardClearMacro?: { macroAddress: Address }`; set on `optimismSepolia`:
`{ macroAddress: "0x77232a2a953b570D1fEE1FE16b1902299fe7b898" }`.

### 4. Relay option UI — form-level, NOT in Settings (revised decision)

A buried Settings toggle hides a feature that changes the signing flow. Instead (decided with the
repo owner):

- **`useClearMacroEligibility(actionKind, network)`** hook in `src/features/clearMacro/` — the
  single source of eligibility truth: network has `dashboardClearMacro` AND
  `clearMacroForwarderAddress[network.id]` exists AND the persisted preference is on AND the
  connected wallet is an EOA (not a smart wallet). Used by BOTH the UI component and (its
  non-React core by) the write path, so what the user sees and what executes cannot drift.
- **`<ClearMacroRelayOption actionKind={...} network={...} />`** — a small chip + switch (e.g.
  "⚡ Gasless via Clear Macro relay") rendered **near the `TransactionButton` of eligible forms
  only**. It displays/flips the persisted preference. Renders `null` when not eligible.
  Deliberately a **sibling component, not a `TransactionButton`/`TransactionBoundary` prop** —
  the button is already heavily parameterized and used by many never-eligible transactions, and
  the boundary doesn't know the action kind; the forms do.
- **Persisted preference**: `clearMacroEnabled: boolean` (default `true`) in `AppSettingsState`
  (`src/features/settings/appSettings.slice.tsx`; `applySettings` already merges partials). Verify
  redux-persist rehydrates a missing key to the default (check how `currencyCode` behaves).
- **Integration points** (the eligible forms; place the component near the primary button):
  send/transfer form, wrap & unwrap forms, send-stream form (eligible live only while no
  start/end schedule is set — the form state makes this reactive), token-access allowance dialog.
- **Reflect relay mode in the in-flight UX** (the button and dialog must not pretend a normal
  broadcast is happening):
  - *Button*: no `TransactionButton` API change. The adjacent chip/switch is the pre-click signal;
    forms may additionally pass a small visual tie (e.g. a bolt `startIcon`) through the existing
    `ButtonProps` when the eligibility hook reports relay will engage.
  - *Dialog*: the relay path has phases the current dialog can't express — `awaiting-signature`
    (the wallet prompt is the blocker) vs `relaying` (signature done; polling the provider —
    nothing left to do in the wallet). Expose a transient `relayPhase?: "preparing" |
    "awaiting-signature" | "relaying"` on the `result` object returned by
    `useSuperfluidWriteContract` (set via a state callback passed into `executeClearMacro`).
    `TransactionBoundary`/`TransactionDialog` already consume `mutationResult`, so the dialog
    renders a standard phase line when `relayPhase` is set — one implementation point, no
    per-form copy. The success view should note the transaction was relayed and link the final
    receipt hash as usual.

### 5. Call sites (action mapping)

Mirror the `direct` pattern: `SubOperation` (in `operations.ts`) gains optional
`clearMacro?: ClearMacroAction`; builders accept it; batched hooks return
`clearMacro: subOperations.length === 1 ? subOperations[0].clearMacro : undefined` (never under
`forceBatch`; the macro is one action per payload).

| Dashboard write | File | Action |
|---|---|---|
| Send Transfer (super token) | `src/features/send/transfer/useTransfer.ts` | `transfer` (attach directly — not SubOperation-based) |
| Wrap (non-native underlying only) | `src/features/tokenWrapping/useTokenWrapWrites.ts` | `upgrade` |
| Unwrap (non-native only) | same | `downgrade` |
| Super-token allowance approve (lone op) | `src/features/tokenAccess/useTokenAccessWrites.ts` (`tokenAllowanceSubOperation`) | `approve` |
| Create/Update/Close stream (lone CFA op, unscheduled) | `src/features/send/useFlowSchedulingWrites.ts` | `createFlow` / `updateFlow` / `deleteFlow` |

Explicitly **not** eligible (no descriptor; always current path): wrap-approve (underlying ERC-20 —
the macro's Approve targets a super token), native-asset wrap/unwrap (`upgradeByETH` is payable),
flow-operator/ACL ops, IDA, GDA/pools, vesting (its lone-CFA delete always pairs with a scheduler
op), auto-wrap, anything multi-op.

### 6. Bookkeeping

- No new `TransactionTitle` needed (original titles kept; the open union lives in
  `TransactionTitleOverrides` in `src/features/redux/endpoints/adHocRpcEndpoints.ts` if one is
  wanted later).
- `txAnalytics` call sites unchanged.

## Known gaps / accepted trade-offs (documented deliberately — do not silently "fix")

1. **Orphaned relay executions.** If the user closes the tab after the relay POST but before the
   terminal state, the relay still executes the signed payload, but the dashboard never tracks it —
   no drawer entry, no pending update. Accepted for the OP Sepolia demo. Future fix: persist
   `{ executionId, chainId, signerAddress, title }` (e.g. redux-persist) before polling and resume
   polling on app load, feeding `trackTransaction` on completion.
2. **Dialog resolves at relay-terminal**, not at wallet-submit — the loading state spans
   confirmation. Accepted (fast blocks on OP Sepolia; web3 UX is eventual-consistency-based
   anyway). Revisit if this ships on slower networks.
3. **Relay fee assumed free on OP Sepolia.** Working assumption from the repo owner. If relay
   POSTs fail with fee/balance errors on a fresh account, consult the provider README
   (<https://github.com/d10r/clearmacro-provider>) for the fee-recovery model and fund the signer.
4. **Smart wallets (ERC-1271) skipped** — they take the fallback path. The relay API accepts
   ERC-1271 signers, but Safe `signTypedData` UX is a follow-up.
5. **Executor accumulating modes** — `useSuperfluidWriteContract` now sequences
   builder → overrides → (macro | simulate+write) → track. Accepted as necessary; keep the macro
   path fully contained in `executeClearMacro` so the executor's branch stays one call.

## Open points to verify at implementation time

1. **`security.domain` / `security.provider` values for relay.** Capabilities expose only
   `providerName` (`macros.superfluid.eth`). Start with `domain = provider = providerName`. If the
   relay rejects with `INVALID_CLEAR_MACRO_PAYLOAD`, its `error.details` says which field is wrong;
   the provider README (<https://github.com/d10r/clearmacro-provider>) is the authority.
2. **EIP-712 `Action` field names** come from `getActionTypeDefinition` at runtime. The encode
   tuple field names are confirmed by the ABI (superToken/spender/receiver/sender/amount/flowRate),
   and the typedef fields are expected to be `description` + those — but the resolver maps by
   parsed name precisely so a divergence degrades to fallback instead of `InvalidSignature`.
   Eyeball the parsed names on the first manual run.
3. Re-fetch `GET /docs/json` before coding the client — the schema above was read on 2026-06-11.

## Verification protocol

1. `pnpm typecheck` && `pnpm lint`.
2. Manual on **Optimism Sepolia**, relay option ON (the form-level switch), EOA wallet
   (`pnpm dev`, switch network in app). First check the option UI itself: the chip/switch shows on
   eligible forms only, and on the send-stream form it disappears live when a start/end date is
   set (multi-op → not eligible). Then per flow:
   - Transfer a super token; wrap; unwrap; create / update / close an **unscheduled** stream; set a
     super-token allowance (Settings → token access). Each: **one EIP-712 signature prompt** showing
     the human-readable `description` (no gas/transaction prompt) → transaction appears in the
     drawer under its normal title after relay success → balances/streams update.
   - Reject the signature → dialog shows the rejection error. Force an on-chain revert (e.g.
     create-flow for an already-open stream) → relay terminal `reverted` surfaces in the dialog.
3. Fallback matrix: relay option OFF → normal wallet transaction; stream **with** start/end date
   (multi-op) → Host `batchCall` as today even with the option ON; any other network → no
   chip, unchanged behavior; wrap-approve / vesting / pools / IDA → unchanged; Gnosis Safe
   (smart wallet) → no chip, normal path. Pre-signature simulation: attempt an obviously reverting
   eligible action (e.g. transfer more than balance) → error in the dialog **before** any
   signature prompt.
4. Relay-side: during a run, `GET /v1/relay-executions/{id}` shows `metadata.source: "dashboard"`
   and the tracked hash equals `receipt.transactionHash`.

---

# Implementation retrospective (2026-06-11)

Implemented on branch `2026-06-10-maintenance` as planned above, plus the corrections below.
Multi-network expansion beyond OP Sepolia is confirmed as the next direction — the per-network
cost is now one line (`dashboardClearMacro: { macroAddress }` in `networks.ts`); everything else
(typedef, field names, description, EIP-712 domain, forwarder address) is runtime-derived and
guarded.

## What the plan got wrong (both invisible until live-tested)

1. **CORS — the relay provider is unreachable from the browser.** No
   `Access-Control-Allow-Origin` header on responses; `OPTIONS` preflight 404s. Every browser
   fetch failed → `ClearMacroNotEligibleError` → silent fallback, so the relay path *never*
   engaged while looking like a normal wallet flow. Fix: same-origin Next.js rewrite
   `/clearmacro-provider/:path*` in `next.config.ts` (mirrors the existing `/balance-api`
   pattern; target overridable via `CLEARMACRO_PROVIDER_REWRITE_TARGET`). Never fetch the
   provider directly from the browser.
2. **EIP-712 field names ≠ ABI tuple names.** The plan's open point 2 materialized: the macro's
   typedefs are hand-written string constants in the contract (see
   `contracts/src/DashboardClearMacro.sol` on the `clearmacro-integration-poc` branch) and name
   the super token field **`token`**, while the Solidity structs / encode tuples say
   `superToken`. Nothing in Solidity ties the two together — the digest hashes only the string
   constants. Verified on-chain for all 7 actions; only `token` diverges. Fix: a single alias in
   `resolveActionFieldValue`. (The old POC branch had it hardcoded correctly —
   `relaySuperTokenTransfer.ts` builds `action: { description, token, ... }`.)
3. **Post-signature `runMacro` simulation is impossible in provider-relay mode** (caught by a
   Codex review, then proven by `eth_call` with a valid throwaway-key signature): the forwarder
   authorizes `security.provider` against **`msg.sender`** — calling `runMacro` from the signer
   (or anyone but the relayer's unknown address) reverts
   `ProviderNotAuthorized("macros.superfluid.eth", sender)`. The plan's step 6 came from the
   reference test, which used `SELF_PROVIDER` + self-submit, where signer == submitter. The
   simulation was removed: the digest pre-check already proves signature validity, and the relay
   runs its own preflight.

**Lesson:** silent pre-signature fallback is the right UX but the wrong debugging default — both
blockers produced *zero visible difference* from the feature not existing. Mitigations added: the
executor's fallback `console.warn` now prints the error **and its `cause`**; and a definitive
**digest pre-check** in `executeClearMacro` — viem's local `hashTypedData` is compared against
the forwarder's on-chain `getDigest(macro, encodedPayload)` before prompting, so ANY assembly
drift on a future deployment (names, types, ordering, domain) degrades to fallback
deterministically instead of a post-signature `SIGNATURE_INVALID` from the relay. The full
assembly was verified to produce the exact on-chain digest for the live OP Sepolia deployment.

## Decisions made during/after implementation (deltas from the plan body)

- **Relay engagement must follow the chip** (post-review decision): write paths whose UI has no
  `ClearMacroRelayOption` carry NO descriptor. Both shared builders use explicit opt-in flags:
  `tokenAllowanceSubOperation`'s `withClearMacro` (passed by `useUpdateAccess`/SaveButton, not by
  `useRevokeAccess`) and `DeleteFlowWithSchedulingArgs.withClearMacro` (passed by the send-stream
  form whose chip covers its Cancel button too, not by the chip-less table-row cancel buttons).
  The wrap-tab chip also hides while the underlying-ERC20 approve step is pending (that approve
  is never gasless).
- The lone-op rule is enforced in exactly one place: `subOperationsWriteFragment` forwards
  `clearMacro` only on its lone-op/no-`forceBatch` branch.
- Eligibility additionally requires `visibleAddress === connected address` (in both the executor
  and `useClearMacroEligibility`) because `isEOA` classifies the *visible* (possibly
  impersonated) address, not the signer.
- `message.security` is populated by runtime-parsed field names with the same
  degrade-to-fallback guard as `message.action` (originally it was passed verbatim).
- `relayPhase` ("preparing" | "awaiting-signature" | "relaying") lives as an optional field on
  the app-owned `MutationResult` type; `TransactionDialog` narrates it and marks relayed
  successes.

## Operational notes

- Debugging "the relay isn't doing anything": browser console first — the fallback warn names
  the real cause. Then the network tab: `GET /clearmacro-provider/v1/capabilities` and
  `POST /clearmacro-provider/v1/relay-executions` should appear.
- Track the relay execution **id** (kept in the tracked tx's `extraData.clearMacroExecutionId`),
  not pre-terminal hashes; only the terminal `receipt.transactionHash` is handed to the tracker,
  so the drawer entry appears already confirmed and the dialog resolves at relay-terminal.
- Relay executions POSTed by the Dashboard carry `metadata.source: "dashboard"`. Provider
  implementation: <https://github.com/d10r/clearmacro-provider>.
- Status at time of writing: `pnpm typecheck` + `pnpm lint` clean; assembly/digest verified
  against the live deployment by script; the full in-wallet manual pass (verification protocol
  above) still pending after the CORS/alias fixes.

---

# Live-relay incident retrospective (2026-06-12)

The first real in-wallet relay attempts surfaced two issues — one provider-side, one a wrong
assumption in this integration. Both are resolved; the diagnosis tooling is kept in the repo.

## Incident 1 — every relay POST rejected 422 `PREFLIGHT_REVERTED` (provider-side)

**Symptom:** all eligible actions (wrap, unwrap, create stream) failed identically with
`{"code":"PREFLIGHT_REVERTED","message":"Preflight simulation predicts revert.","details":{}}`
while `GET /v1/capabilities` listed OP Sepolia and `/readyz` reported the chain healthy.

**Mechanics learned (verified against contract + provider source):**

- The provider's preflight is literally `simulateContract(runMacro(...))` with
  `account = <its OZ-Relayer signer>`, run AFTER it has already validated payload decode,
  provider-name match, validity window, on-chain digest, and signature recovery. A 422 here
  therefore means: *the signed payload is valid, but `runMacro` reverts for the relay's own
  `msg.sender`*.
- Provider authorization in `ClearMacroForwarderV1` is an ACL role check:
  `host.getSimpleACL().hasRole(keccak256(bytes(security.provider)), msg.sender)` →
  `ProviderNotAuthorized` otherwise. For `"macros.superfluid.eth"` the role is
  `0xa8065c0b59bd99669ef24c43a12bf99e885a427d15fe63a6dc8bc405aefb6bc4`; the OP Sepolia
  SimpleACL is `0x87574bf2cd718a4521127cfcb4bccbc6c095babf`.
- The provider's `/readyz` checks RPC + relayer + signer *balance* but **not** the ACL role —
  a signer without the role looks fully healthy while rejecting 100% of executions.

**Root cause:** the provider's OP Sepolia OZ-Relayer signer
(`0x29e21461982d900ca7cd211f1e740f7221754f4f`) did not hold the provider role. Proven by
replaying the verbatim failing request body via `eth_call runMacro` from role-granted
executors (succeeds) vs others (`ProviderNotAuthorized`) — i.e. the Dashboard-built payload
was correct and executable. The operator granted the role; relaying then worked first try.

**Diagnosis decision rule (reusable):** on `PREFLIGHT_REVERTED`, run
`node scripts/clearmacro-relay-replay.mjs <request-body.json>` with the failing POST body
from the browser's network tab. It verifies digest/signature recovery, nonce, validity, the
executor's role grant, and decodes the actual revert. If `runMacro` simulates OK from
role-granted executors → provider-side (signer authorization); if it reverts with a protocol
error → genuine action-level failure. Mind the validity window: an expired/replayed body
reports `OutsideValidityWindow`/`InvalidNonce` by design.

## Incident 2 — successful relay surfaced as an ERROR in the dialog (dashboard-side)

**Symptom:** the first successful relay showed the dialog error
`Relayed transaction succeeded (execution 0d00be36-…)`.

**Root cause:** the plan body (and the API description) claimed terminal `succeeded` always
carries `receipt.transactionHash`. The live provider returned terminal `succeeded` with **no
`receipt` at all** — only `transaction.hash` (which was confirmed on-chain, status 1).
`pollRelayExecutionUntilTerminal` resolved only on `succeeded && receipt`, so the success hit
the throw branch. **Correction to the API-facts section above:** at terminal, the final hash
is `receipt?.transactionHash ?? transaction.hash` — `transaction.hash` can no longer be
replaced once `terminal: true`.

**Fix:** `getFinalTransactionHash(execution)` in `relayApi.ts` encodes that rule; the poll
resolves on `succeeded` + final-hash-present and `executeClearMacro` returns it. Reported
upstream as an API-description mismatch. Also hardened: all `ClearMacroRelayError` messages
now append the relay error's `details` when populated (it was empty during incident 1, which
is itself upstream feedback — `PREFLIGHT_REVERTED` should carry the revert data).
