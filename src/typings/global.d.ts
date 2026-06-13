import { Ethereum } from "wagmi/connectors";

// Lenient on purpose: this is set by hand from the browser console.
type GasOverrideInput = bigint | number | string;

export type GlobalGasOverrides = {
  gasLimit?: GasOverrideInput;
  gasPrice?: GasOverrideInput;
  maxFeePerGas?: GasOverrideInput;
  maxPriorityFeePerGas?: GasOverrideInput;
};

export type SuperfluidDashboardGlobal = {
  advanced: {
    // Will be used to override gas settings for the next transaction attempt.
    nextGasOverrides: GlobalGasOverrides;
    addCustomToken: (token: NetworkCustomToken) => Promise<void>;
  };
};

// Solution inspired by: https://stackoverflow.com/a/69429093
declare global {
  interface Window {
    superfluid_dashboard: SuperfluidDashboardGlobal;
    bitkeep?: { ethereum?: Ethereum };
  }
}

export {};
