/** Anything `BigInt()` can consume via `toString()` — covers bigint, string, number and ethers BigNumber. */
type BigIntish = bigint | string | number | { toString(): string };

const toBigInt = (value: BigIntish): bigint =>
  typeof value === "bigint" ? value : BigInt(value.toString());

const MAX_INT256 =
  57896044618658097711785492504343953926634992332820282019728792003956564819967n;
const MAX_TOKEN_ALLOWANCE_THRESHOLD = MAX_INT256 / 2n; // "Good enough solution". Could also compare with token total supply. Or uint... Doesn't matter too much, the values are huge.

const MAX_INT96 = 39614081257132168796771975168n;
const MAX_FLOWRATE_ALLOWANCE_THRESHOLD = MAX_INT96 / 2n;

export const isCloseToUnlimitedTokenAllowance = (wei: BigIntish) =>
  toBigInt(wei) > MAX_TOKEN_ALLOWANCE_THRESHOLD;

export const isCloseToUnlimitedFlowRateAllowance = (wei: BigIntish) =>
  toBigInt(wei) > MAX_FLOWRATE_ALLOWANCE_THRESHOLD;
