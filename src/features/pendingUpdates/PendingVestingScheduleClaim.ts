import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";
import { ClaimVestingSchedule } from "../redux/endpoints/vestingSchedulerEndpoints";

export interface PendingVestingScheduleClaim
  extends PendingUpdate,
    Pick<
      ClaimVestingSchedule,
      "chainId" | "superTokenAddress" | "senderAddress" | "receiverAddress"
    > {
  pendingType: "VestingScheduleClaim";
}

export const isPendingVestingScheduleClaim = (
  x: PendingUpdate
): x is PendingVestingScheduleClaim =>
  x.pendingType === "VestingScheduleClaim";

export const useAddressPendingVestingScheduleClaims = (
  address: string | undefined
): PendingVestingScheduleClaim[] => {
  const allPendingUpdates = useAppSelector((state) =>
    pendingUpdateSelectors.selectAll(state.pendingUpdates)
  );

  return useMemo(
    () =>
      address
        ? allPendingUpdates
            .filter(isPendingVestingScheduleClaim)
            .filter(
              (x) => x.senderAddress.toLowerCase() === address.toLowerCase()
            )
        : [],
    [address, allPendingUpdates]
  );
};

export const usePendingVestingScheduleClaim = (
  {
    chainId,
    superTokenAddress,
    senderAddress,
    receiverAddress,
  }: {
    chainId: number;
    superTokenAddress: string;
    senderAddress: string;
    receiverAddress: string;
  },
  options?: { skip: boolean }
) => {
  const list = useAddressPendingVestingScheduleClaims(senderAddress);

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
              x.senderAddress.toLowerCase() ===
                superTokenAddress.toLowerCase() &&
              x.senderAddress.toLowerCase() === receiverAddress.toLowerCase()
          )[0], // We assume no duplicates here.
    [chainId, superTokenAddress, receiverAddress, list, skip]
  );
};
