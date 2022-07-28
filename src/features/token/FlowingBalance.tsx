import { memo, ReactElement, useEffect, useMemo, useState } from "react";
import { BigNumberish, BigNumber, utils } from "ethers";
import { Box } from "@mui/material";
import Amount from "./Amount";
import { useStateWithDep } from "../../useStateWithDep";
import Decimal from "decimal.js";

// Keep it below a second.
const ANIMATION_MINIMUM_STEP_TIME = 75;

export interface FlowingBalanceProps {
  balance: string;
  /**
   * Timestamp in Subgraph's UTC.
   */
  balanceTimestamp: number;
  flowRate: string;
  disableRoundingIndicator?: boolean;
  tokenSymbol?: string;
}

export default memo(function FlowingBalance({
  balance,
  balanceTimestamp,
  flowRate,
  tokenSymbol,
}: FlowingBalanceProps): ReactElement {
  const [weiValue, setWeiValue] = useStateWithDep<BigNumberish>(balance);

  const flowRateBigNumber = useMemo(() => BigNumber.from(flowRate), [flowRate]);

  /*
   * TODO: When using this variable then ~ sign in Ether should be disabled
   * Calculating decimals based on the flow rate.
   * This is configurable by ANIMATING_NR_COUNT and should shows
   * roughly how many trailing numbers will animate each second.
   */
  const etherSignificantFlowingDecimal = useMemo<number | undefined>(() => {
    if (flowRateBigNumber.isZero()) {
      return undefined;
    }

    const ticksPerSecond = 1000 / ANIMATION_MINIMUM_STEP_TIME;
    const flowRatePerTick = new Decimal(flowRate)
      .div(ticksPerSecond)
      .toFixed(0);

    const afterEtherDecimal = utils.formatEther(flowRatePerTick).split(".")[1];
    const numberAfterDecimalWithoutLeadingZeroes = Number(afterEtherDecimal);
    const lengthToFirstSignificatDecimal = afterEtherDecimal
      .toString()
      .replace(numberAfterDecimalWithoutLeadingZeroes.toString(), "").length;

    if (lengthToFirstSignificatDecimal === 17) return 18; // Don't go over 18.

    // This will usually have the last 3 numbers flowing smoothly.
    return lengthToFirstSignificatDecimal + 2;
  }, [flowRate]);

  const balanceTimestampMs = useMemo(
    () => BigNumber.from(balanceTimestamp).mul(1000),
    [balanceTimestamp]
  );

  useEffect(() => {
    if (flowRateBigNumber.isZero()) {
      return; // No need to show animation when flow rate is zero.
    }

    const balanceBigNumber = BigNumber.from(balance);

    let lastAnimationTimestamp: DOMHighResTimeStamp = 0;

    const animationStep = (currentAnimationTimestamp: DOMHighResTimeStamp) => {
      animationFrameId = window.requestAnimationFrame(animationStep); // Set next frame ASAP, otherwise race-conditions might happen when trying to cancel.

      if (
        currentAnimationTimestamp - lastAnimationTimestamp >
        ANIMATION_MINIMUM_STEP_TIME
      ) {
        const currentTimestampBigNumber = BigNumber.from(
          new Date().valueOf() // Milliseconds elapsed since UTC epoch, disregards timezone.
        );

        setWeiValue(
          balanceBigNumber.add(
            currentTimestampBigNumber
              .sub(balanceTimestampMs)
              .mul(flowRateBigNumber)
              .div(1000)
          )
        );

        lastAnimationTimestamp = currentAnimationTimestamp;
      }
    };

    let animationFrameId = window.requestAnimationFrame(animationStep);

    return () => window.cancelAnimationFrame(animationFrameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balance, balanceTimestamp, flowRateBigNumber]);

  return (
    <Box
      component="span"
      sx={{
        textOverflow: "ellipsis",
      }}
      data-cy={"balance"}
    >
      <Amount
        wei={weiValue}
        decimalPlaces={etherSignificantFlowingDecimal}
      />{" "}
      {tokenSymbol}
    </Box>
  );
});
