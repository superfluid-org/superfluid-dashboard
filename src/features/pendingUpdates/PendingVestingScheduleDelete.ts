import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";
import { DeleteVestingSchedule } from "../redux/endpoints/vestingSchedulerEndpoints";

export interface PendingVestingScheduleDeletion
  extends PendingUpdate,
    Pick<
    DeleteVestingSchedule,
      | "chainId"
      | "superTokenAddress"
      | "senderAddress"
      | "receiverAddress"
    > {
  pendingType: "VestingScheduleDelete";
}

export const isPendingVestingScheduleDeletion = (
  x: PendingUpdate
): x is PendingVestingScheduleDeletion => x.pendingType === "VestingScheduleDelete";

export const useAddressPendingVestingScheduleDeletes = (
  address: string | undefined
): PendingVestingScheduleDeletion[] => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  return useMemo(
    () =>
      address
        ? allPendingUpdates
            .filter(isPendingVestingScheduleDeletion)
            .filter(
              (x) => x.senderAddress.toLowerCase() === address.toLowerCase()
            )
        : [],
    [address, allPendingUpdates]
  );
};
