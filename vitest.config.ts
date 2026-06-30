import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    server: {
      deps: {
        inline: [
          "viem",
          "abitype",
          "wagmi",
          "@wagmi/core",
          "@d10r/wagmi-superfluid-wallet",
        ],
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
