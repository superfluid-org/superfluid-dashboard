import { After, Before } from "@badeball/cypress-cucumber-preprocessor";
import { VestingPage } from "../../pageObjects/pages/VestingPage";
import {
  clearScenarioNetworkAllowlist,
  setScenarioNetworkAllowlist,
} from "../scenarioNetworkAllowlist";

Before(() => {
  cy.log("Custom tokens set at local storage ✅");
  window.localStorage.setItem(
    "customTokens",
    `{"56":"0x1E38baa2735128Bcc23792fF9AaE96EA7aA7ecd2,0x0419e1fA3671754F77EC7D5416219A5f9A08B530"}`
  );
  // Cleared here rather than in an After hook: After does not run when a scenario fails (see the
  // @rejected note below), and a leaked flag would silently route later scenarios through the
  // relay. Hooks run in definition order, so the @gaslessRelayEnabled hook re-enables it after
  // this reset for the scenarios that want it.
  Cypress.env("gaslessRelayEnabled", false);
  // Same reasoning as above: cleared here, not in an After hook, so a scenario-scoped
  // network allowlist cannot leak into the scenarios that follow a failure.
  clearScenarioNetworkAllowlist();
});

Before({ tags: "@rejected" }, function () {
  //Don't add rejected cases together with transactional ones , as the before hook will change the env value and it should
  //persist for the whole spec file, sadly the cucumber After hook doesn't get executed if a test case fails, so it might reject transactional cases
  //Could add another hook before transactional cases, but will leave as is for now, to not mess around with the env values too much
  cy.log("Cypress will reject wallet transactions!");
  Cypress.env("rejected", true);
});

Before({ tags: "@platformNeeded" }, () => {
  Cypress.env("platformNeeded", true);
});

// Scheduling a stream on a Clear Macro network is forced through the gasless relay: the send form
// keeps submit disabled until the relay toggle is on (`isSchedulerRelayForced` in SendStream.tsx).
// Every network that supports scheduling is a Clear Macro network, so seed the persisted preference
// before the app boots -- otherwise these scenarios would only ever assert the relay opt-in gate
// instead of the scheduling flow they are actually about.
// The preference itself is written in `Common.openDashboardWithConnectedTxAccount`'s
// `onBeforeLoad`, so it lands in the application window before redux-persist rehydrates --
// a Before hook here would only reach the spec window.
Before({ tags: "@gaslessRelayEnabled" }, () => {
  cy.log("Clear Macro gasless relay will be enabled ✅");
  Cypress.env("gaslessRelayEnabled", true);
});

// The gasless relay fee gate can only be reached where `dan` holds enough of the stream token
// to make the send form valid -- the form keeps submit disabled below the CFA buffer plus 24h
// of streaming, so an empty wallet never gets as far as the fee gate. `dan` is funded on these
// three networks only; on gnosis and avalanche it holds nothing and cannot be funded, so the
// scenario is gated to the networks where it is actually meaningful. See the comment above the
// scenario in RejectedStreamAndIndexTransactions.feature.
Before({ tags: "@relayFeeGateNetworksOnly" }, () => {
  setScenarioNetworkAllowlist(["polygon", "arbitrum-one", "optimism"]);
});

// Alias the vesting-scheduler detail query before the schedule details page loads, so the
// details assertions can read the schedule's seed-relative createdAt/endDate from the real
// (or mocked) response instead of stale static fixtures. Registered here (not in a step)
// because some scenarios open the details page directly in their first Given.
Before({ tags: "@capturesVestingDetail" }, () => {
  VestingPage.captureVestingScheduleDetail();
});
