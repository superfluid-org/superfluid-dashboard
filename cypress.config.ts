import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    projectId: "2aaadn",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
