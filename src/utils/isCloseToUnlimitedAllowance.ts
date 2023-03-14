import { BigNumber, BigNumberish, constants } from "ethers";

const MAX_TOKEN_ALLOWANCE_THRESHOLD = BigNumber.from(
  "185300117949871645334565329424510626622745482287187539616755380238997531968"
); // 3/4 of uint256. "Good enough solution". Could also compare with token total supply.

const MAX_FLOWRATE_ALLOWANCE_THRESHOLD = BigNumber.from(
  "29714560942849626097578981375"
); // 3/4 of int96

export const isCloseToUnlimitedTokenAllowance = (wei: BigNumberish) =>
  BigNumber.from(wei).gt(MAX_TOKEN_ALLOWANCE_THRESHOLD);

export const isCloseToUnlimitedFlowRateAllowance = (wei: BigNumberish) =>
  BigNumber.from(wei).gt(MAX_FLOWRATE_ALLOWANCE_THRESHOLD);
