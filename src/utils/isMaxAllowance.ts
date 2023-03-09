import { BigNumber, BigNumberish, constants } from "ethers";

const MAX_TOKEN_ALLOWANCE_THRESHOLD = BigNumber.from(
  "185300117949871645334565329424510626622745482287187539616755380238997531968"
); // 3/4 of uint256. "Good enough solution". Could also compare with token total supply.

const MAX_STREAM_ALLOWANCE_THRESHOLD = BigNumber.from(
  "29714560942849626097578981375"
); // 3/4 of int96

export const isMaxTokenAllowance = (wei: BigNumberish) =>
  BigNumber.from(wei).gt(MAX_TOKEN_ALLOWANCE_THRESHOLD);

export const isMaxStreamAllowance = (wei: BigNumberish) =>
  BigNumber.from(wei).gt(MAX_STREAM_ALLOWANCE_THRESHOLD);
