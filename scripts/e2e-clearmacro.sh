#!/usr/bin/env bash
set -euo pipefail

MODE="mocked"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --mode)
      MODE="${2:-}"
      shift 2
      ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: $0 [--mode mocked|live]" >&2
      exit 1
      ;;
  esac
done

if [[ "$MODE" != "mocked" && "$MODE" != "live" ]]; then
  echo "Invalid mode: $MODE (expected mocked|live)" >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TESTS_DIR="$ROOT_DIR/tests"
PROVIDER_DIR="${CLEARMACRO_PROVIDER_DIR:-$ROOT_DIR/../clearmacro-provider}"
PROVIDER_COMPOSE_FILE="$PROVIDER_DIR/compose.dashboard-op-sepolia.yaml"

APP_PORT="${APP_PORT:-3000}"
PROVIDER_PORT="${CLEARMACRO_PROVIDER_PORT:-3001}"
APP_BASE_URL="http://127.0.0.1:$APP_PORT"
PROVIDER_BASE_URL="http://127.0.0.1:$PROVIDER_PORT"
SPEC_FILE="${SPEC_FILE:-cypress/integration/TransferPageClearMacro.feature}"
APP_LOG_PATH="$ROOT_DIR/.tmp/e2e-clearmacro-dashboard-dev.log"

APP_PID=""
STARTED_PROVIDER_STACK="0"

wait_for_http() {
  local name="$1"
  local url="$2"
  local timeout_seconds="$3"
  local elapsed=0

  until curl -fsS "$url" >/dev/null; do
    sleep 2
    elapsed=$((elapsed + 2))
    if [[ "$elapsed" -ge "$timeout_seconds" ]]; then
      echo "Timed out waiting for $name at $url" >&2
      return 1
    fi
  done
}

ensure_not_running() {
  local name="$1"
  local url="$2"
  if curl -fsS "$url" >/dev/null 2>&1; then
    echo "$name is already responding at $url; please stop it or change the port." >&2
    return 1
  fi
}

cleanup() {
  local exit_code=$?
  set +e

  if [[ -n "$APP_PID" ]] && kill -0 "$APP_PID" 2>/dev/null; then
    kill "$APP_PID" 2>/dev/null
    wait "$APP_PID" 2>/dev/null
  fi

  if [[ "$STARTED_PROVIDER_STACK" == "1" ]]; then
    docker compose -f "$PROVIDER_COMPOSE_FILE" down --remove-orphans >/dev/null
  fi

  exit "$exit_code"
}
trap cleanup EXIT

if [[ ! -d "$TESTS_DIR" ]]; then
  echo "tests directory not found: $TESTS_DIR" >&2
  exit 1
fi

ensure_not_running "dashboard-app" "$APP_BASE_URL"

if [[ "$MODE" == "live" ]]; then
  if [[ ! -f "$PROVIDER_COMPOSE_FILE" ]]; then
    echo "Provider compose file not found: $PROVIDER_COMPOSE_FILE" >&2
    exit 1
  fi

  ensure_not_running "clearmacro-provider" "$PROVIDER_BASE_URL"

  export OZ_RELAYER_API_KEY="${OZ_RELAYER_API_KEY:-dashboard-e2e-api-key}"
  export OZ_STORAGE_ENCRYPTION_KEY="${OZ_STORAGE_ENCRYPTION_KEY:-MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=}"
  export OZ_WEBHOOK_SIGNING_KEY="${OZ_WEBHOOK_SIGNING_KEY:-dashboard-e2e-webhook-signing-key-32chars-min}"
  export OZ_KEYSTORE_PASSPHRASE="${OZ_KEYSTORE_PASSPHRASE:-change-me}"

  docker compose -f "$PROVIDER_COMPOSE_FILE" up -d --build
  STARTED_PROVIDER_STACK="1"
  wait_for_http "clearmacro-provider" "$PROVIDER_BASE_URL/healthz" 120
fi

if [[ "$MODE" == "mocked" ]]; then
  CYPRESS_TAGS='@clearmacro and not @clearmacroLive'
else
  CYPRESS_TAGS='@clearmacroLive'
fi

NEXT_PUBLIC_CLEARMACRO_PROVIDER_URL="$PROVIDER_BASE_URL" \
NEXT_PUBLIC_CLEARMACRO_ENABLED=true \
mkdir -p "$ROOT_DIR/.tmp"
pnpm --dir "$ROOT_DIR" dev >"$APP_LOG_PATH" 2>&1 &
APP_PID="$!"

wait_for_http "dashboard-app" "$APP_BASE_URL" 120

pnpm --dir "$TESTS_DIR" cypress run \
  --spec "$SPEC_FILE" \
  --env "TAGS=$CYPRESS_TAGS,network=opsepolia,dev=false"
