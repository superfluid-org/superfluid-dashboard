import { getUnixTime } from "date-fns";
import { useState, useEffect } from "react";

const useUnixDateWithVestingTriggers = (
  cliffAndFlowDate: string,
  endDate: string
) => {
  const [unixNow, setUnixNow] = useState(getUnixTime(new Date()));

  useEffect(() => {
    let timeout: number | null = null;

    const startUnix = Number(cliffAndFlowDate);
    const endUnix = Number(endDate);

    const untilStartMs = (startUnix - unixNow) * 1000;
    const untilEndMs = (endUnix - unixNow) * 1000;

    if (untilStartMs > 0) {
      timeout = window.setTimeout(() => setUnixNow(startUnix), untilStartMs);
    } else if (untilEndMs > 0) {
      timeout = window.setTimeout(() => setUnixNow(endUnix), untilEndMs);
    }

    return () => {
      if (timeout !== null) window.clearTimeout(timeout);
    };
  }, [unixNow, cliffAndFlowDate, endDate]);

  return unixNow;
};

export default useUnixDateWithVestingTriggers;
