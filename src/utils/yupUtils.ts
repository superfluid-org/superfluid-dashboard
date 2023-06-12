import { BigNumber, BigNumberish } from "ethers";
import { isAddress, parseEther } from "ethers/lib/utils";
import { AnyObject, TestContext, TestFunction } from "yup";
import { NATIVE_ASSET_ADDRESS } from "../features/redux/endpoints/tokenTypes";

interface IsWeiOrEtherAmountOptions {
  notNegative?: boolean;
  notZero?: boolean;
}

export const testAddresses: () => TestFunction<string[], AnyObject> =
  () => (value, context) =>
    !value.some((address) => !validateAddress(address, context));

export const testAddress: () => TestFunction<string, AnyObject> =
  () => (value, context) =>
    validateAddress(value, context);

const validateAddress = (address: string, context: TestContext) => {
  if (!isAddress(address) && address !== NATIVE_ASSET_ADDRESS) {
    throw context.createError({
      message: "Not an address.",
    });
  }

  return true;
};

export const testEtherAmount: (
  options: IsWeiOrEtherAmountOptions
) => TestFunction<string, AnyObject> = (options) => (value, context) => {
  let bigNumber: BigNumber;
  try {
    bigNumber = parseEther(value);
  } catch (error) {
    throw context.createError({
      message: "Not a number.",
    });
  }

  if (options.notNegative && bigNumber.isNegative()) {
    throw context.createError({
      message: "May not be negative.",
    });
  }

  if (options.notZero && bigNumber.isZero()) {
    throw context.createError({
      message: "May not be zero.",
    });
  }

  return true;
};

export const testWeiAmount: (
  options: IsWeiOrEtherAmountOptions
) => TestFunction<BigNumberish, AnyObject> = (options) => (value, context) => {
  let bigNumber: BigNumber;
  try {
    bigNumber = BigNumber.from(value);
  } catch (error) {
    throw context.createError({
      message: "Not a number.",
    });
  }

  if (options.notNegative && bigNumber.isNegative()) {
    throw context.createError({
      message: "May not be negative.",
    });
  }

  if (options.notZero && bigNumber.isZero()) {
    throw context.createError({
      message: "May not be zero.",
    });
  }

  return true;
};