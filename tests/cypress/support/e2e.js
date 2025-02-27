// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
import "@cypress/code-coverage/support";
import "cypress-real-events";

Cypress.on("uncaught:exception", (err, runnable) => {
  if (
    err.name === "ConnectorNotFoundError" ||
    err.message.includes(
      "The method eth_call is not implemented by the mock provider."
    ) ||
    err.message.includes("invalid decimal value") ||
    //Lifi bridge server errors when opening settings page
    err.name.includes("AxiosError") ||
    err.name.includes("ServerError") ||
    err.message.includes(
      "Request failed with status code 429 Too Many Requests"
    ) ||
    //An error popping up on scroll sepolia , cannot reproduce manually
    err.message.includes("getInitialProps") ||
    //Error popping up when loading gnosis safe custom apps page
    err.message.includes("Minified React error #418") ||
    err.message.includes("Minified React error #423") ||
    //Failing request to LiFi due to some of the chains supported in the dashboard
    err.message.includes("Request failed with status code 400 Bad Request") ||
    //Dev mode error in bridge page
    err.message.includes("_data$event.startsWith is not a function")
  ) {
    return false;
  }
});

Cypress.on("fail", (err, runneable) => {
  if (
    err.message.includes(
      "PollingBlockTracker - encountered an error while attempting to update latest block"
    ) ||
    err.name.includes("PollingBlockTracker") ||
    //BSC mainnet sometimes throws these, similar to Pooling block tracker
    err.message.includes("Could not find block") ||
    err.message.includes("([object ProgressEvent])")
  ) {
    return false;
  } else {
    throw err;
  }
});

// Hide fetch/XHR requests from cypress runner: https://gist.github.com/simenbrekken/3d2248f9e50c1143bf9dbe02e67f5399
const app = window.top;
if (!app.document.head.querySelector("[data-hide-command-log-request]")) {
  const style = app.document.createElement("style");
  style.innerHTML =
    ".command-name-request, .command-name-xhr { display: none }";
  style.setAttribute("data-hide-command-log-request", "");

  app.document.head.appendChild(style);
}
