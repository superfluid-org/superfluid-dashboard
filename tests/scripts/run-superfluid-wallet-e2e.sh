#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TESTS="$(cd "$(dirname "$0")/.." && pwd)"

node "$TESTS/scripts/setup-superfluid-wallet-e2e.mjs"

if ! curl -sf "http://localhost:3000" >/dev/null 2>&1; then
  echo ""
  echo "Dashboard is not running on http://localhost:3000."
  echo "Start it from the repo root: pnpm dev"
  echo "(.env.local should set NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED=true — setup script handles this.)"
  exit 1
fi

cd "$TESTS"
env -u ELECTRON_RUN_AS_NODE CYPRESS_CACHE_FOLDER="${CYPRESS_CACHE_FOLDER:-$HOME/.cache/Cypress}" \
  pnpm cypress run \
  --spec cypress/integration/SuperfluidWalletWrap.feature \
  --env TAGS="@superfluidWallet"
