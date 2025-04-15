import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";
import { ClaimVestingSchedule } from "../redux/endpoints/vestingSchedulerEndpoints";
import { VestingVersion } from "../network/networks";

export interface PendingVestingScheduleUpdate
  extends PendingUpdate,
    Pick<
      ClaimVestingSchedule, // Meh
      "chainId" | "superTokenAddress" | "senderAddress" | "receiverAddress"
    > {
  pendingType: "VestingScheduleUpdate";
  version: "v2" | "v3"
}

export const isPendingVestingScheduleUpdate = (
  x: PendingUpdate
): x is PendingVestingScheduleUpdate => x.pendingType === "VestingScheduleUpdate";

export const useAddressPendingVestingScheduleUpdates = (
  address: string | undefined
): PendingVestingScheduleUpdate[] => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  return useMemo(
    () =>
      address
        ? allPendingUpdates
            .filter(isPendingVestingScheduleUpdate)
            .filter(
              (x) =>
                x.senderAddress.toLowerCase() === address.toLowerCase() ||
                x.receiverAddress.toLowerCase() === address.toLowerCase()
            )
        : [],
    [address, allPendingUpdates]
  );
};

export const usePendingVestingScheduleUpdate = (
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
    version: VestingVersion;
  },
  options?: { skip: boolean }
) => {
  const list = useAddressPendingVestingScheduleUpdates(senderAddress);

  const skip = options?.skip ?? false;

  return useMemo(
    () =>
      skip
        ? undefined
        : list.filter(
            (x) =>
              x.chainId === chainId &&
              x.version === version &&
              x.superTokenAddress.toLowerCase() ===
                superTokenAddress.toLowerCase() &&
              (x.senderAddress.toLowerCase() === senderAddress.toLowerCase() ||
                x.receiverAddress.toLowerCase() ===
                  receiverAddress.toLowerCase())
          )[0], // We assume no duplicates here.
    [chainId, superTokenAddress, receiverAddress, list, skip]
  );
};
