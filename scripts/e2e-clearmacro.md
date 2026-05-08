# ClearMacro E2E Runner

This repository now exposes two local E2E entry points:

- `pnpm e2e:clearmacro:mocked`
- `pnpm e2e:clearmacro:live`

Both commands are orchestrated by `scripts/e2e-clearmacro.sh`.

## Prerequisites

- `pnpm install` in `dashboard` and `dashboard/tests`
- `dashboard/tests/cypress.env.json` with test private keys
- Docker Desktop/Engine available on PATH for `live` mode

## Modes

- `mocked`: starts dashboard only, runs the ClearMacro feature with provider capabilities intercepted by Cypress.
- `live`: starts the external `clearmacro-provider` stack via `../clearmacro-provider/compose.dashboard-op-sepolia.yaml`, starts dashboard, then runs the live ClearMacro scenario.

## Optional environment overrides

- `APP_PORT` (default `3000`)
- `CLEARMACRO_PROVIDER_PORT` (default `3001`)
- `SPEC_FILE` (default `cypress/integration/TransferPageClearMacro.feature`)
- `CLEARMACRO_PROVIDER_DIR` (default `../clearmacro-provider`)
