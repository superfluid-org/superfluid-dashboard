import { useMemo } from "react";
import { PendingUpdate } from "./PendingUpdate";
import { pendingUpdateSelectors } from "./pendingUpdate.slice";
import { useAppSelector } from "../redux/store";
import { CreateVestingSchedule } from "../redux/endpoints/vestingSchedulerEndpoints";
import { Address } from "@superfluid-finance/sdk-core";
import { VestingSchedule, vestingStatuses } from "../vesting/types";
import { calculateVestingScheduleAllocated } from "../../utils/vestingUtils";

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
      | "version"
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
    version
  } = pendingVestingSchedule;
  const cliffAndFlowDate = cliffDateTimestamp
    ? cliffDateTimestamp
    : startDateTimestamp;

  const totalAmount = calculateVestingScheduleAllocated(
    cliffAndFlowDate,
    endDateTimestamp,
    flowRateWei,
    cliffTransferAmountWei,
    "0"
  ).toString();

  return {
    pendingCreate: pendingVestingSchedule,
    id: `${superTokenAddress}-${address}-${receiverAddress}-${version}-${pendingVestingSchedule.transactionHash}`,
    superToken: superTokenAddress,
    sender: address,
    receiver: receiverAddress,
    flowRate: flowRateWei,
    createdAt: pendingVestingSchedule.timestamp,
    startDate: startDateTimestamp,
    cliffDate: cliffDateTimestamp,
    cliffAmount: cliffTransferAmountWei,
    endDateValidAt: endDateTimestamp,
    endDate: endDateTimestamp,
    cliffAndFlowDate: cliffAndFlowDate,
    cliffAndFlowExpirationAt: cliffAndFlowDate,
    didEarlyEndCompensationFail: false,
    earlyEndCompensation: "0",
    failedAt: undefined,
    status: vestingStatuses.ScheduledStart,
    claimValidityDate: 0,
    remainderAmount: "0",
    version,
    transactionHash: pendingVestingSchedule.transactionHash,
    totalAmount,
    totalAmountWithOverpayment: totalAmount, // For pending schedules, there's no overpayment yet
  };
};
