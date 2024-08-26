import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";
import { DeleteVestingSchedule } from "../redux/endpoints/vestingSchedulerEndpoints";

export interface PendingVestingScheduleDeletion
  extends PendingUpdate,
    Pick<
      DeleteVestingSchedule,
      "chainId" | "superTokenAddress" | "senderAddress" | "receiverAddress" | "version"
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

export const usePendingVestingScheduleDelete = (
  {
    chainId,
    superTokenAddress,
    senderAddress,
    receiverAddress,
    version
  }: {
    chainId: number;
    superTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
    version: "v1" | "v2"
  },
  options?: { skip: boolean }
) => {
  const list = useAddressPendingVestingScheduleDeletes(senderAddress);

  const skip = options?.skip ?? false;

  return useMemo(
    () =>
      skip
        ? undefined
        : list.filter(
            (x) =>
              x.chainId === chainId &&
              x.superTokenAddress.toLowerCase() ===
                superTokenAddress.toLowerCase() &&
              x.receiverAddress.toLowerCase() === receiverAddress.toLowerCase() &&
              x.version === version
          )[0], // We assume no duplicates here.
    [chainId, superTokenAddress, receiverAddress, list, skip, version]
  );
};