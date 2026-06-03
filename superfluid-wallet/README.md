# Superfluid Wallet

Hosted popup wallet for the Superfluid Dashboard PoC. Runs as a separate npm project from the dashboard.

## Local development

```bash
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_ORGANIZATION_ID and NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID
# In Turnkey dashboard: auth proxy allowed origins must include http://localhost:3001

pnpm install
pnpm dev
```

Runs at http://localhost:3001. Pair with the dashboard at http://localhost:3000.

If `pnpm install` warns about ignored build scripts, ensure `pnpm-workspace.yaml` has `allowBuilds` for `esbuild`, `sharp`, and `unrs-resolver` set to `true`, then re-run install.

If **Sign In** appears to do nothing, restart the wallet dev server after pulling — Tailwind must scan `./node_modules/@turnkey/react-wallet-kit` (not the dashboard root) so the Turnkey login modal CSS is generated.

## Tests

```bash
pnpm test
```

Unit tests cover RPC transaction shapes from the dashboard (e.g. wrap sending `gasLimit` instead of `gas`). Dashboard Cypress tests use in-process `mockBridge` / HDWallet and do not exercise this popup wallet.

## Environment

| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_DAPP_ORIGIN` | `http://localhost:3000` | Dashboard origin for `postMessage` target |
| `NEXT_PUBLIC_ORGANIZATION_ID` | — | Turnkey organization ID |
| `NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID` | — | Turnkey auth proxy config ID |

## Session duration (30 days)

With **Auth Proxy**, session lifetime is **not** set in code. `TurnkeyProvider` `auth.sessionExpirationSeconds` is ignored (the SDK logs a warning if you set it).

Configure it in the Turnkey dashboard:

1. Open [app.turnkey.com](https://app.turnkey.com) → your organization.
2. Go to **Embedded Wallets** → **Configuration** (or **AUTH**).
3. Find **Session expiration** (default `900` = 15 minutes).
4. Set to **`2592000`** (= 30 days) and save.

Verify the active config (uses the same ID as `NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID`):

```bash
curl -sS -X POST https://authproxy.turnkey.com/v1/wallet_kit_config \
  -H "Content-Type: application/json" \
  -H "X-Auth-Proxy-Config-Id: YOUR_AUTH_PROXY_CONFIG_ID" \
  -d '{}' | jq .sessionExpirationSeconds
# Expected: "2592000"
```

After changing the dashboard value:

- **Existing sessions keep their old expiry** — disconnect and sign in again (or clear site data for `localhost:3001`).
- New logins get the 30-day TTL stored in the session’s `expiry` field on the wallet origin (`localhost:3001`).

`autoRefreshSession: true` in `app/providers.tsx` only extends a session while a wallet popup is open (Turnkey schedules refresh ~1 minute before expiry). It cannot refresh when no `:3001` tab exists; a longer dashboard TTL is what makes “dashboard idle, then wrap later” work without re-OTP.
