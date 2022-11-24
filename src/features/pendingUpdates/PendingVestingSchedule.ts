import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";
import { CreateVestingSchedule } from "../redux/endpoints/vestingSchedulerEndpoints";
import { Address } from "@superfluid-finance/sdk-core";
import { VestingSchedule } from "../../vesting-subgraph/schema.generated";

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
    cliffDate: cliffDateTimestamp.toString(),
    cliffAmount: cliffTransferAmountWei,
    endDate: endDateTimestamp.toString(),
    flowRate: flowRateWei,
    receiver: receiverAddress,
    sender: address,
    startDate: startDateTimestamp.toString(),
    superToken: superTokenAddress,
  };
};
