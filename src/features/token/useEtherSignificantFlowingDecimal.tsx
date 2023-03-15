import Decimal from "decimal.js";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useMemo } from "react";

const ANIMATION_MINIMUM_STEP_TIME = 75;

const useSignificantFlowingDecimal = (flowRate: string, price = 1) =>
  useMemo<number | undefined>(() => {
    const flowRateBigNumber = BigNumber.from(flowRate);

    if (flowRateBigNumber.isZero()) {
      return undefined;
    }

    const priceDecimal = new Decimal(price);
    const ticksPerSecond = 1000 / ANIMATION_MINIMUM_STEP_TIME;
    const flowRatePerTick = new Decimal(flowRate)
      .mul(priceDecimal)
      .div(ticksPerSecond)
      .toFixed(0);

    const [beforeEtherDecimal, afterEtherDecimal] =
      formatEther(flowRatePerTick).split(".");

    const isFlowingInWholeNumbers = new Decimal(beforeEtherDecimal).abs().gt(0);
    if (isFlowingInWholeNumbers) {
      return 0; // Flowing in whole numbers per tick.
    }

    const numberAfterDecimalWithoutLeadingZeroes = new Decimal(
      afterEtherDecimal
    );

    const lengthToFirstSignificatDecimal = afterEtherDecimal
      .toString()
      .replace(numberAfterDecimalWithoutLeadingZeroes.toString(), "").length; // We're basically counting the zeroes.

    if (lengthToFirstSignificatDecimal === 17) return 18; // Don't go over 18.

    // This will usually have the last 3 numbers flowing smoothly.
    return lengthToFirstSignificatDecimal + 2;
  }, [flowRate, price]);

export default useSignificantFlowingDecimal;
