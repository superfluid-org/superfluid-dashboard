# Superfluid Wallet HFA Setup Implementation Spec

## Goal

Add a user-facing `Enable HFA` setup flow to Superfluid Wallet. The flow lets an authenticated embedded-wallet user grant an agent and the HFA provider cosigner delegated Turnkey access that requires both parties to approve the same signing activity.

This is a PoC iteration. Optimize for a working, understandable prototype with good user journey and reasonable tests. Avoid unnecessary production framework work.

Cross-repo context lives in the HFA repo at `specs/superfluid-wallet-hfa-integration.md`.

## Existing Wallet Baseline

Current app behavior:

- `app/providers.tsx` configures `@turnkey/react-wallet-kit` with Auth Proxy.
- Email OTP auth is the currently used human auth path.
- `auth.createSuborgParams` creates a default Ethereum wallet account on signup.
- `components/auth.tsx` handles connect/unlock.
- `components/sign-transaction.tsx` signs normal dashboard transactions directly with the authenticated user session.

Do not regress normal dashboard connect/sign behavior.

## New User Journey

The setup URL will be opened from an HFA agent helper:

```text
http://localhost:3001/hfa/setup?session=<setupSessionId>&hfa=<encoded-hfa-base-url>
```

Production equivalent:

```text
https://wallet.superfluid.org/hfa/setup?session=<setupSessionId>&hfa=<encoded-hfa-base-url>
```

Flow:

1. User opens setup link.
2. Wallet fetches HFA setup-session details.
3. If the user is not authenticated, show email OTP sign-in.
4. After auth, show consent screen with:
   - connected wallet address,
   - agent label/public key,
   - provider label `Superfluid HFA`,
   - concise explanation: agent can propose actions, but HFA provider approval after human approval is also required.
5. User clicks `Enable HFA`.
6. Wallet creates/reuses Turnkey delegated users for agent and provider public keys.
7. Wallet creates/reuses the co-approval policy.
8. Wallet calls HFA complete endpoint.
9. Show success screen: HFA is enabled for this wallet.

The user must not need Turnkey dashboard access and must not manually handle private keys.

## Route And UI

Add a dedicated page:

```text
app/hfa/setup/page.tsx
```

Use existing visual language: simple centered wallet card, concise copy, no unrelated dashboard dependencies.

Suggested states:

- `loading_setup`: fetching HFA setup session.
- `needs_auth`: show sign-in button.
- `ready`: show consent card and `Enable HFA` button.
- `submitting`: disable button and show progress.
- `success`: setup completed.
- `error`: show actionable error and retry when safe.

The page can be client-rendered if that makes SDK usage simpler.

## HFA Setup Session Client

Add a small client module, for example:

```text
lib/hfa-setup-client.ts
```

Responsibilities:

- Parse and validate `session` and `hfa` URL params.
- Fetch `GET <hfaBase>/api/turnkey/hfa/setup-sessions/:id`.
- Post `POST <hfaBase>/api/turnkey/hfa/setup-sessions/:id/complete`.

Validation:

- `session` must be non-empty.
- `hfa` must decode to an `http://` or `https://` URL.
- For local dev, allow `http://localhost:*` and `http://127.0.0.1:*`.
- Do not accept arbitrary non-HTTP protocols.

The setup session response includes:

- `agentPublicKey`
- `agentLabel`
- `providerPublicKey`
- `status`
- `expiresAt`

If status is already `completed`, show success or already-enabled state.

## Turnkey Delegated Access Setup

Use the authenticated Turnkey user session from `useTurnkey()`.

Implement a small helper module, for example:

```text
lib/hfa-turnkey-setup.ts
```

Responsibilities:

1. Resolve the active sub-org ID from `session.organizationId`.
2. Resolve the active EVM wallet account from `wallets`.
3. Create/reuse the agent DA user using the setup session `agentPublicKey`.
4. Create/reuse the provider DA user using the setup session `providerPublicKey`.
5. Create/reuse the HFA co-approval policy.
6. Return `subOrganizationId`, `walletAddress`, `agentUserId`, `providerUserId`, and `policyIds`.

Use Turnkey's delegated-access helpers if available in the installed SDK:

- `fetchOrCreateP256ApiKeyUser`
- `fetchOrCreatePolicies`

If the exact export shape differs in `@turnkey/react-wallet-kit@2.0.0`, use the closest SDK-supported equivalent and document the choice in code comments/tests.

## Policy Template

Create an allow policy requiring both delegated users:

```json
{
  "policyName": "HFA co-approval for <walletAddress>",
  "effect": "EFFECT_ALLOW",
  "consensus": "approvers.any(user, user.id == '<AGENT_USER_ID>') && approvers.any(user, user.id == '<PROVIDER_USER_ID>')",
  "condition": "activity.type == 'ACTIVITY_TYPE_SIGN_TRANSACTION_V2' && wallet_account.address == '<WALLET_ADDRESS>'"
}
```

Implementation note:

- Confirm this condition works against Turnkey policy evaluation for EVM `SIGN_TRANSACTION_V2`.
- If `wallet_account.address` is not populated for this activity type, use the narrowest verified alternative, such as `eth.tx.from == '<WALLET_ADDRESS>'` with the same `activity.type` guard.
- Keep the condition simple for the PoC. Do not add complex Superfluid-specific calldata restrictions in this iteration.

The important invariant is the consensus clause: both agent and provider users must approve.

## Wallet Account Selection

For the PoC, use the first EVM wallet account in the active Turnkey wallet session.

Validation:

- There must be at least one `0x` EVM account.
- The address shown to the user must equal the address sent to HFA completion.
- Preserve Turnkey's exact address casing where possible for `signWith` compatibility.

If multiple EVM accounts exist, pick the same account used by existing direct signing logic unless that adds complexity. Otherwise show a simple selector only if necessary.

## Completing Setup With HFA

After Turnkey setup succeeds, call HFA:

```text
POST <hfaBase>/api/turnkey/hfa/setup-sessions/:id/complete
```

Payload:

```json
{
  "subOrganizationId": "...",
  "walletAddress": "0x...",
  "agentPublicKey": "...",
  "agentUserId": "...",
  "providerUserId": "...",
  "policyIds": ["..."],
  "walletOrigin": "http://localhost:3001"
}
```

If HFA completion fails after Turnkey setup succeeded, show an error that setup may have partially completed and allow retry. Retrying should be safe because Turnkey setup helpers should be idempotent and HFA complete should reject or return completed for already-completed sessions.

## Copy Guidelines

Consent screen copy should be clear and non-alarming:

```text
Enable HFA for this Superfluid Wallet

This lets your agent prepare transactions for this wallet. Transactions still require Human-First Approval before Superfluid HFA co-signs them. The agent cannot sign alone, and Superfluid HFA cannot sign alone.
```

Button:

```text
Enable HFA
```

Success:

```text
HFA is enabled for this wallet. You can return to your agent.
```

Avoid exposing Turnkey jargon like sub-organization, DA user, or policy in the primary UI. It can appear in a small technical details disclosure if useful for debugging.

## Tests

Add tests that do not require Turnkey network access.

Required unit coverage:

- URL param parser accepts valid HFA setup URLs and rejects invalid protocols.
- HFA setup client builds correct GET and complete URLs.
- Policy builder produces consensus requiring both agent and provider user IDs.
- Policy builder includes a wallet/account condition.
- Wallet account resolver returns the expected EVM account and rejects missing accounts.
- Setup helper calls delegated-access user creation for both public keys.
- Setup helper posts the expected completion payload to HFA.

Suggested component tests if the project already has a convenient setup; otherwise keep unit tests:

- unauthenticated setup page shows sign-in state,
- ready state shows agent label and wallet address,
- successful setup shows success state,
- setup failure shows retryable error.

Run before handing off:

```bash
pnpm check-types
pnpm test
```

If lint is configured and stable in this repo, also run:

```bash
pnpm lint
```

## Manual Validation

Mocked/local validation:

1. Start HFA locally with setup-session endpoints.
2. Start Superfluid Wallet locally on port 3001.
3. Create a setup session from HFA or agent helper.
4. Open the setup URL.
5. Mock or use real Turnkey auth depending on environment.
6. Complete setup and confirm HFA session becomes `completed`.

Live Turnkey validation:

1. Configure `NEXT_PUBLIC_ORGANIZATION_ID` and `NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID`.
2. Ensure Auth Proxy allows the local wallet origin.
3. Sign in with email OTP.
4. Enable HFA.
5. Confirm no Turnkey dashboard interaction was needed.
6. Confirm HFA receives sub-org, wallet address, delegated user IDs, and policy IDs.
7. Run an HFA agent request and confirm the initial Turnkey sign activity reaches `CONSENSUS_NEEDED` rather than completing with agent alone.

## Final Review Checklist For OpenCode

Review findings should focus on bugs and risks. Check:

- The page uses the authenticated user session, not provider/admin secrets.
- No private key is generated or stored by Superfluid Wallet.
- Agent and provider public keys come from HFA setup session data.
- Policy consensus requires both user IDs.
- The wallet address displayed equals the wallet address registered with HFA.
- The HFA base URL parser does not allow unsafe protocols.
- Normal `eth_requestAccounts`, `eth_signTransaction`, `eth_sign`, and `personal_sign` popup flows are not regressed.
- Tests cover URL parsing, policy building, and completion payload construction.

## Out Of Scope

- Dashboard-side UI changes beyond opening setup links.
- Revocation/disable HFA UI.
- Multiple agents per wallet UI.
- Policy editing UI.
- Complex contract allowlists or Superfluid-specific calldata policies.
- Support for arbitrary external Turnkey organizations outside the Superfluid Wallet Auth Proxy setup.
