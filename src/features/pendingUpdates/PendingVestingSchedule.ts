import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";
import { CreateVestingSchedule } from "../redux/endpoints/vestingSchedulerEndpoints";
import { Address } from "@superfluid-finance/sdk-core";
import { VestingSchedule } from "../vesting/types";

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

export const mapPendingToVestingSchedule = (
  address: Address,
  pendingVestingSchedule: PendingVestingSchedule
): VestingSchedule & { pendingCreate: PendingVestingSchedule } => {
  const {
    cliffDateTimestamp,
    cliffTransferAmountWei,
    endDateTimestamp,
    receiverAddress,
    startDateTimestamp,
    superTokenAddress,
    flowRateWei,
  } = pendingVestingSchedule;

  return {
    pendingCreate: pendingVestingSchedule,
    id: `${receiverAddress}-${superTokenAddress}-${startDateTimestamp}`,
    superToken: superTokenAddress,
    sender: address,
    receiver: receiverAddress,
    flowRate: flowRateWei,
    createdAt: pendingVestingSchedule.timestamp.toString(),
    startDate: startDateTimestamp.toString(),
    cliffDate: cliffDateTimestamp.toString(),
    cliffAmount: cliffTransferAmountWei,
    endDateValidAt: endDateTimestamp.toString(),
    endDate: endDateTimestamp.toString(),
    cliffAndFlowDate: cliffDateTimestamp
      ? cliffDateTimestamp.toString()
      : startDateTimestamp.toString(),
    didEarlyEndyCompensationFail: false,
    earlyEndCompensation: "0",
    failedAt: null,
  };
};
