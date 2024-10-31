import { getUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { ValidVestingForm } from "./CreateVestingFormProvider";
import { convertPeriodToSeconds } from "./batch/convertPeriod";

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
}: Omit<ValidVestingForm, "superTokenAddress" | "receiverAddress">) => {
  const startDateTimestamp = getUnixTime(startDate);
  const cliffDateTimestamp = cliffEnabled
    ? startDateTimestamp +
      Math.round((cliffPeriod.numerator || 0) * cliffPeriod.denominator)
    : 0;

  const cliffAndFlowTimestamp = cliffEnabled
    ? cliffDateTimestamp
    : startDateTimestamp;

  // Has to be rounded because of decimals
  const endDateTimestamp = startDateTimestamp + convertPeriodToSeconds(vestingPeriod);

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
