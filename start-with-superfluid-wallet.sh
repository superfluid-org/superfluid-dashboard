#!/usr/bin/env bash
set -euo pipefail

export NEXT_PUBLIC_SUPERFLUID_WALLET_ENABLED=true
export NEXT_PUBLIC_SUPERFLUID_WALLET_URL="${NEXT_PUBLIC_SUPERFLUID_WALLET_URL:-http://localhost:3001}"
export NEXT_PUBLIC_HFA_ENABLED=true
export NEXT_PUBLIC_HFA_URL="${NEXT_PUBLIC_HFA_URL:-http://localhost:5712}"
export NEXT_PUBLIC_TURNKEY_API_BASE_URL="${NEXT_PUBLIC_TURNKEY_API_BASE_URL:-https://api.turnkey.com}"

exec pnpm dev
