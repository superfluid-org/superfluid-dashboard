const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    projectId: "2aaadn",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
