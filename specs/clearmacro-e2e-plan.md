# ClearMacro E2E Plan

## Goal

Provide a repeatable local E2E workflow for Dashboard ClearMacro integration that:

- works on a developer machine without GitHub Actions coupling,
- supports both fast deterministic runs and realistic relay runs,
- keeps operational complexity low.

## Approach

Use two explicit E2E modes behind a single orchestrator script:

1. `mocked` mode (default for local iteration)
2. `live` mode (integration smoke with external provider stack)

The orchestrator is `scripts/e2e-clearmacro.sh` and is exposed via package scripts.

## Implemented Commands

- `pnpm e2e:clearmacro:mocked`
- `pnpm e2e:clearmacro:live`

## Mode Details

### 1) Mocked Mode

Purpose: fast, stable feedback on Dashboard flow and fallback behavior.

- Starts Dashboard app with ClearMacro UI enabled via env:
  - `NEXT_PUBLIC_CLEARMACRO_PROVIDER_URL=http://127.0.0.1:3001`
  - `NEXT_PUBLIC_CLEARMACRO_ENABLED=true`
- Runs Cypress spec `cypress/integration/TransferPageClearMacro.feature`
- Uses tag filter to run only mocked ClearMacro scenario:
  - `@clearmacro and not @clearmacroLive`
- Relies on Cypress intercepts for provider capabilities (no provider process required).

### 2) Live Mode

Purpose: validate end-to-end relay integration with external provider API.

- Starts provider stack through Compose in `../clearmacro-provider`:
  - `compose.dashboard-op-sepolia.yaml`
- Waits for provider health endpoint (`/healthz`).
- Starts Dashboard app with ClearMacro env configured to the local provider URL.
- Runs Cypress with live scenario tag:
  - `@clearmacroLive`

## Script Behavior and Guardrails

The runner intentionally avoids hidden complexity:

- explicit `--mode mocked|live`,
- readiness checks for app/provider URLs before running tests,
- early failure if required ports are already occupied,
- deterministic cleanup via shell trap:
  - stop app process,
  - `docker compose down --remove-orphans` for live mode.

## Prerequisites

- `pnpm install` in `dashboard`
- `pnpm install` in `dashboard/tests`
- `dashboard/tests/cypress.env.json` populated with required test private keys
- Docker available for `live` mode

## Non-Goals (Current Scope)

- No change to GitHub CI workflow wiring in this step.
- No always-on Compose requirement for mocked mode.
- No expansion beyond current ClearMacro transfer E2E feature in this iteration.

## Iteration Guidance

After first green local runs:

1. keep mocked mode as default dev path,
2. run live mode as smoke before release candidates,
3. optionally extend same pattern to ClearMacro CFA E2E coverage.
