import { BigNumber } from "ethers";
import { isAddress } from "ethers/lib/utils";
import { AnyObject, TestFunction } from "yup";

interface IsEtherAmountOptions {
  notNegative?: boolean;
  notZero?: boolean;
}

export const testAddress: () => TestFunction<string, AnyObject> =
  () => (value, context) => {
    if (!isAddress(value)) {
      throw context.createError({
        message: "Not an address.",
      });
    }

    return true;
  };

export const testEtherAmount: (
  options: IsEtherAmountOptions
) => TestFunction<string, AnyObject> = (options) => (value, context) => {
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
