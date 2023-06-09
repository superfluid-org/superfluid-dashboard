import { BigNumber, BigNumberish } from "ethers";
import { useEffect, useMemo } from "react";
import { useStateWithDep } from "../../useStateWithDep";

const ANIMATION_MINIMUM_STEP_TIME = 75;

const useFlowingBalance = (
  balance: string,
  balanceTimestamp: number,
  flowRate: string
) => {
  const [weiValue, setWeiValue] = useStateWithDep<BigNumberish>(balance);

  const flowRateBigNumber = useMemo(() => BigNumber.from(flowRate), [flowRate]);

  const balanceTimestampMs = useMemo(
    () => BigNumber.from(balanceTimestamp).mul(1000),
    [balanceTimestamp]
  );

  useEffect(() => {
    // No need to show animation when flow rate is zero.
    if (flowRateBigNumber.isZero()) return;

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

  return { weiValue };
};

export default useFlowingBalance;
