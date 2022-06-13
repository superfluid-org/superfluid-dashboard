import { FC, memo, ReactElement, useEffect, useMemo, useState } from "react";
import { BigNumberish, ethers } from "ethers";
import { Box } from "@mui/material";
import EtherFormatted from "./EtherFormatted";
import { useStateWithDep } from "../../useStateWithDep";

const ANIMATION_MINIMUM_STEP_TIME = 80;
const ANIMATING_NR_COUNT = 3;

export interface FlowingBalanceProps {
  balance: string;
  /**
   * Timestamp in Subgraph's UTC.
   */
  balanceTimestamp: number;
  flowRate: string;
  etherDecimalPlaces?: number;
  disableRoundingIndicator?: boolean;
  tokenSymbol?: string;
}

export default memo(function FlowingBalance({
  balance,
  balanceTimestamp,
  flowRate,
  etherDecimalPlaces,
  tokenSymbol
}: FlowingBalanceProps): ReactElement {
  const [weiValue, setWeiValue] = useStateWithDep<BigNumberish>(balance);

  /*
   * TODO: When using this variable then ~ sign in EtherFormatted should be disabled
   * Calculating decimals based on the flow rate.
   * This is configurable by ANIMATING_NR_COUNT and should shows
   * roughly how many trailing numbers will animate each second.
   */
  const decimals = useMemo(
    () =>
      Math.min(18 - flowRate.replace("-", "").length + ANIMATING_NR_COUNT, 18),
    [flowRate]
  );

  const balanceTimestampMs = useMemo(
    () => ethers.BigNumber.from(balanceTimestamp).mul(1000),
    [balanceTimestamp]
  );

  useEffect(() => {
    const flowRateBigNumber = ethers.BigNumber.from(flowRate);
    if (flowRateBigNumber.isZero()) {
      return; // No need to show animation when flow rate is zero.
    }

    const balanceBigNumber = ethers.BigNumber.from(balance);

    let lastAnimationTimestamp: DOMHighResTimeStamp = 0;

    const animationStep = (currentAnimationTimestamp: DOMHighResTimeStamp) => {
      animationFrameId = window.requestAnimationFrame(animationStep); // Set next frame ASAP, otherwise race-conditions might happen when trying to cancel.

      if (
        currentAnimationTimestamp - lastAnimationTimestamp >
        ANIMATION_MINIMUM_STEP_TIME
      ) {
        const currentTimestampBigNumber = ethers.BigNumber.from(
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
  }, [balance, balanceTimestamp, flowRate]);

  return (
    <Box
      component="span"
      sx={{
        textOverflow: "ellipsis",
      }}
      data-cy={"balance"}
    >
      <EtherFormatted
        disableRoundingIndicator
        wei={weiValue}
        etherDecimalPlaces={etherDecimalPlaces || decimals}
      /> {tokenSymbol}
    </Box>
  );
});
