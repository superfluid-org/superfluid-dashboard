# Superfluid Wallet (hosted popup)

Turnkey-backed signing UI for the Superfluid Dashboard. Runs as a **separate npm project** on port **3001**; the dashboard on **3000** talks to it only via popup URL parameters and `postMessage` (no shared React bundle).

**Architecture, provenance, and learnings:** [`../docs/superfluid-wallet-integration.md`](../docs/superfluid-wallet-integration.md).

## Local setup

```bash
cp .env.local.example .env.local
# Set NEXT_PUBLIC_ORGANIZATION_ID and NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID
pnpm install
pnpm dev
```

Pair with the dashboard:

```bash
# from repo root
NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED=true pnpm dev
```

In [Turnkey Dashboard → Wallet Kit → Authentication](https://app.turnkey.com/dashboard/v2/wallet-kit?tab=authentication), allow origin `http://localhost:3001` (Auth Proxy allowed origins). Session expiration for the PoC org is **30 days** (`2592000` s), not the Turnkey default 900 s — configured in that dashboard screen, not in this repo.

## Environment

| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_DAPP_ORIGIN` | `http://localhost:3000` | Target origin for `postMessage` replies |
| `NEXT_PUBLIC_ORGANIZATION_ID` | — | Turnkey organization ID |
| `NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID` | — | Auth Proxy config ID (`X-Auth-Proxy-Config-Id`) |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.turnkey.com` | Optional |
| `NEXT_PUBLIC_AUTH_PROXY_BASE_URL` | `https://authproxy.turnkey.com` | Optional |

## Troubleshooting

- **`pnpm install` / ignored builds:** ensure `pnpm-workspace.yaml` has `allowBuilds` for `esbuild`, `sharp`, `unrs-resolver`.
- **Sign In appears inert:** restart dev server after pull; `tailwind.config.ts` must scan `./node_modules/@turnkey/react-wallet-kit/dist/**` (not the dashboard’s `node_modules`).
- **Session expired at sign:** use **Sign in to continue** in the popup; dashboard disconnect is not required.

## Tests

```bash
pnpm test          # vitest: normalize-rpc-transaction, resolve-turnkey-sign-with
pnpm check-types
```

Dashboard Cypress wrap tests use a **mock** EIP-1193 handler and do not open this app.
