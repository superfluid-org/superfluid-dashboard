import { Overrides } from "ethers";

export type GlobalGasOverrides = Pick<
  Overrides,
  "gasLimit" | "gasPrice" | "maxFeePerGas" | "maxPriorityFeePerGas"
>;

export type SuperfluidDashboardGlobal = {
  advanced: {
    // Will be used to override gas settings for the next transaction attempt.
    nextGasOverrides: GlobalGasOverrides;
  };
};

// Solution inspired by: https://stackoverflow.com/a/69429093
declare global {
  interface Window {
    superfluid_dashboard: SuperfluidDashboardGlobal;
  }
}

export {};
