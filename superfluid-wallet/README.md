# Superfluid Wallet (hosted popup)

Turnkey-backed signing UI for the Superfluid Dashboard. Runs as a **separate npm project** on port **3001**; the dashboard on **3000** talks to it only via popup URL parameters and `postMessage` (no shared React bundle).

**Architecture, provenance, and learnings:** [`../docs/superfluid-wallet-integration.md`](../docs/superfluid-wallet-integration.md).

## Local setup

```bash
cp .env.local.example .env.local
# Set NEXT_PUBLIC_ORGANIZATION_ID and NEXT_PUBLIC_AUTH_PROXY_CONFIG_ID
pnpm install
pnpm playwright:install   # once: downloads Chromium for E2E tests (~100MB)
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
- **Sign In appears inert:** restart dev server after pull; `tailwind.config.ts` must scan `./node_modules/@turnkey/react-wallet-kit/dist/**`.
- **Turnkey login modal clipped or overflowing:** do not set a fixed width on `.tk-modal .bg-modal-background-*` in `globals.css` (Turnkey sizes the panel itself). Verify with `pnpm test:e2e:turnkey-modal` — writes `turnkey-login-modal.png` under `test-results/` for inspection.
- **Session expired at sign:** use **Sign in to continue** in the popup; dashboard disconnect is not required.

## HFA delegated-access setup

Pair a Superfluid Wallet with the HFA provider (separate `hfa` repo):

1. HFA: `npm run dev` (provider API)
2. Wallet: `pnpm dev` or `pnpm dev:clean` if the setup page is blank after code changes
3. HFA: `npm run turnkey:hfa-setup` → open the printed URL → email OTP → **Enable HFA**

Setup page: `/hfa/setup?session=…&hfa=…` (HFA provider base URL in `hfa=` query param).

```bash
pnpm smoke:hfa-setup   # SETUP_URL='<full setup link>' — headless hydration check
```

Spec: [`specs/hfa-setup-implementation.md`](specs/hfa-setup-implementation.md).

## Tests

```bash
pnpm test          # vitest (lib unit tests)
pnpm check-types
pnpm test:e2e      # Playwright (requires pnpm playwright:install once)
pnpm test:all      # all of the above
```

E2E uses Playwright’s bundled Chromium. After `pnpm install`, run `pnpm playwright:install` once (same as `pnpm exec playwright install chromium` in [Playwright docs](https://playwright.dev/docs/intro#installing-playwright)).

Dashboard Cypress wrap tests use a **mock** EIP-1193 handler and do not open this app.
