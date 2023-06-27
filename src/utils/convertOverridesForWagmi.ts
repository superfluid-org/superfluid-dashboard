import { BigNumber, Overrides } from "ethers";

// Wagmi's `Overrides` is a bit different than ethers.js's `Overrides`.
export const convertOverridesForWagmi = (
  overrides: Overrides
): {
  gas?: bigint | undefined;
  gasPrice?: bigint | undefined;
  maxFeePerGas?: bigint | undefined;
  maxPriorityFeePerGas?: bigint | undefined;
  nonce?: number | undefined;
} => {
  return {
    gas: overrides.gasLimit ? BigInt(overrides.gasLimit.toString()) : undefined,
    gasPrice: overrides.gasPrice
      ? BigInt(overrides.gasPrice.toString())
      : undefined,
    maxFeePerGas: overrides.maxFeePerGas
      ? BigInt(overrides.maxFeePerGas.toString())
      : undefined,
    maxPriorityFeePerGas: overrides.maxPriorityFeePerGas
      ? BigInt(overrides.maxPriorityFeePerGas.toString())
      : undefined,
    nonce: overrides.nonce
      ? BigNumber.from(overrides.nonce).toNumber()
      : undefined,
  };
};
