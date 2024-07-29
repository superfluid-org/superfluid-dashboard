import { getUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { ValidVestingForm } from "./CreateVestingFormProvider";

// Terrible name, for now... but better to move this form data transformation logic somewhere.
export const calculateAdditionalDataFromValidVestingForm = ({
  data: {
    startDate,
    totalAmountEther,
    cliffEnabled,
    cliffPeriod,
    cliffAmountEther,
    vestingPeriod
  },
}: ValidVestingForm) => {
  const startDateTimestamp = getUnixTime(startDate);
  const cliffDateTimestamp = cliffEnabled
    ? startDateTimestamp +
      Math.round((cliffPeriod.numerator || 0) * cliffPeriod.denominator)
    : 0;

  const cliffAndFlowTimestamp = cliffEnabled
    ? cliffDateTimestamp
    : startDateTimestamp;

  // Has to be rounded because of decimals
  const endDateTimestamp =
    startDateTimestamp +
    Math.round(vestingPeriod.numerator * vestingPeriod.denominator);

  const timeToFlow = endDateTimestamp - cliffAndFlowTimestamp;

  const cliffAmount = parseEtherOrZero(cliffAmountEther || "0");
  const totalAmount = parseEtherOrZero(totalAmountEther);
  const streamedAmount = totalAmount.sub(cliffAmount);
  const flowRate = BigNumber.from(streamedAmount).div(timeToFlow);

  return {
    startDateTimestamp,
    cliffDateTimestamp,
    cliffAndFlowTimestamp,
    endDateTimestamp,
    timeToFlow,
    cliffAmount,
    totalAmount,
    streamedAmount,
    flowRate,
  };
};
