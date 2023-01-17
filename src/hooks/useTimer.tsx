import { useEffect, useState } from "react";
import { UnitOfTime } from "../features/send/FlowRateInput";

const useTimer = (interval: UnitOfTime) => {
  const [dateNow, setDateNow] = useState(new Date());

  useEffect(() => {
    const intervalKey = window.setInterval(() => {
      setDateNow(new Date());
    }, interval * 1000);

    return () => {
      if (!!intervalKey) window.clearInterval(intervalKey);
    };
  }, [interval]);

  return dateNow;
};

export default useTimer;
