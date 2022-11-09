import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";
import { CreateVestingSchedule } from "../redux/endpoints/vestingSchedulerEndpoints";

export interface PendingVestingSchedule
  extends PendingUpdate,
    Pick<
      CreateVestingSchedule,
      | "chainId"
      | "superTokenAddress"
      | "senderAddress"
      | "receiverAddress"
      | "startDateTimestamp"
      | "cliffDateTimestamp"
      | "flowRateWei"
      | "endDateTimestamp"
      | "cliffTransferAmountWei"
    > {
  pendingType: "VestingScheduleCreate";
}

export const isPendingVestingSchedule = (
  x: PendingUpdate
): x is PendingVestingSchedule => x.pendingType === "VestingScheduleCreate";

export const useAddressPendingVestingSchedules = (
  address: string | undefined
): PendingVestingSchedule[] => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  return useMemo(
    () =>
      address
        ? allPendingUpdates
            .filter(isPendingVestingSchedule)
            .filter(
              (x) => x.senderAddress.toLowerCase() === address.toLowerCase()
            )
        : [],
    [address, allPendingUpdates]
  );
};
