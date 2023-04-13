import { BigNumber, Overrides } from "ethers";

// Wagmi's `Overrides` is a bit different than ethers.js's `Overrides`.
export const convertOverridesForWagmi = (overrides: Overrides) => {
  return {
    ...overrides,
    gasPrice: overrides.gasPrice
      ? BigNumber.from(overrides.gasPrice)
      : undefined,
    gasLimit: overrides.gasLimit
      ? BigNumber.from(overrides.gasLimit)
      : undefined,
    maxFeePerGas: overrides.maxFeePerGas
      ? BigNumber.from(overrides.maxFeePerGas)
      : undefined,
    maxPriorityFeePerGas: overrides.maxPriorityFeePerGas
      ? BigNumber.from(overrides.maxPriorityFeePerGas)
      : undefined,
    nonce: overrides.nonce
      ? BigNumber.from(overrides.nonce).toNumber()
      : undefined,
  };
};
