import { defineConfig } from "vitest/config";

/**
 * Unit tests for the pure, dependency-free modules only — hash derivation, version comparison,
 * action fingerprinting, guard predicates. Rendering and data-fetching stay with Cypress
 * (`tests/`), which is a separate pnpm workspace and is excluded here.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
