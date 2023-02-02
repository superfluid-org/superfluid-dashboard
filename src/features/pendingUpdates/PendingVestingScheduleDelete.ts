import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";
import { DeleteVestingSchedule } from "../redux/endpoints/vestingSchedulerEndpoints";

export interface PendingVestingScheduleDeletion
  extends PendingUpdate,
    Pick<
      DeleteVestingSchedule,
      "chainId" | "superTokenAddress" | "senderAddress" | "receiverAddress"
    > {
  pendingType: "VestingScheduleDelete";
}

export const isPendingVestingScheduleDeletion = (
  x: PendingUpdate
): x is PendingVestingScheduleDeletion =>
  x.pendingType === "VestingScheduleDelete";

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

export const usePendingVestingScheduleDelete = ({
  chainId,
  superTokenAddress,
  senderAddress,
  receiverAddress,
}: {
  chainId: number;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}) => {
  const list = useAddressPendingVestingScheduleDeletes(senderAddress);

  return useMemo(
    () =>
      list.filter(
        (x) =>
          x.chainId === chainId &&
          x.superTokenAddress.toLowerCase() ===
            superTokenAddress.toLowerCase() &&
          x.receiverAddress.toLowerCase() === receiverAddress.toLowerCase()
      )[0], // We assume no duplicates here.
    [chainId, superTokenAddress, receiverAddress, list]
  );
};
