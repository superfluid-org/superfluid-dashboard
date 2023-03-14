import { BigNumber, BigNumberish } from "ethers";

const MAX_INT256 = BigNumber.from("57896044618658097711785492504343953926634992332820282019728792003956564819967");
const MAX_TOKEN_ALLOWANCE_THRESHOLD = MAX_INT256.div(2); // "Good enough solution". Could also compare with token total supply. Or uint... Doesn't matter too much, the values are huge.

const MAX_INT96 = BigNumber.from("39614081257132168796771975168");
const MAX_FLOWRATE_ALLOWANCE_THRESHOLD = MAX_INT96.div(2);

export const isCloseToUnlimitedTokenAllowance = (wei: BigNumberish) => BigNumber.from(wei).gt(MAX_TOKEN_ALLOWANCE_THRESHOLD);

export const isCloseToUnlimitedFlowRateAllowance = (wei: BigNumberish) =>
  BigNumber.from(wei).gt(MAX_FLOWRATE_ALLOWANCE_THRESHOLD);
