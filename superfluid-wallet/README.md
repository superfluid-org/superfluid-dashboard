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

## Session duration

When using Turnkey Auth Proxy, configure session duration in the Turnkey dashboard (auth proxy config). The SDK ignores `sessionExpirationSeconds` on the provider when auth proxy is enabled.
