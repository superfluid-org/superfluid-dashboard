import { GlobalGasOverrides } from "../typings/global";

export interface ViemFeeOverrides {
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasPrice?: bigint;
  gas?: bigint;
}

const toBigInt = (value: unknown): bigint | undefined => {
  if (value === undefined || value === null) return undefined;
  // Values produced by `useGetTransactionOverrides` are concrete ethers BigNumbers / numbers,
  // never the `Promise<BigNumberish>` that ethers' `Overrides` type also permits.
  return BigInt((value as { toString: () => string }).toString());
};

/**
 * Maps the ethers-shaped gas overrides from `useGetTransactionOverrides` onto viem's
 * `writeContract`/`simulateContract` fee fields. `gasLimit: 0` (the smart-wallet case,
 * e.g. Gnosis Safe) is kept as a `gas: 0n` sentinel — `useSuperfluidWriteContract`
 * interprets it as "omit gas and skip simulation; the smart wallet handles estimation".
 */
export function ethersOverridesToViem(
  overrides?: GlobalGasOverrides
): ViemFeeOverrides {
  if (!overrides) return {};

  const result: ViemFeeOverrides = {};

  const maxFeePerGas = toBigInt(overrides.maxFeePerGas);
  if (maxFeePerGas !== undefined) result.maxFeePerGas = maxFeePerGas;

  const maxPriorityFeePerGas = toBigInt(overrides.maxPriorityFeePerGas);
  if (maxPriorityFeePerGas !== undefined)
    result.maxPriorityFeePerGas = maxPriorityFeePerGas;

  const gasPrice = toBigInt(overrides.gasPrice);
  if (gasPrice !== undefined) result.gasPrice = gasPrice;

  const gas = toBigInt(overrides.gasLimit);
  if (gas !== undefined) result.gas = gas;

  return result;
}
