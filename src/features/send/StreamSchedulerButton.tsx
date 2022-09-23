import { FC } from "react";
import { Network } from "../network/networks";
import { rpcApi } from "../redux/store";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";

export const StreamSchedulerButton: FC<{
  network: Network;
  senderAddress: string;
  superTokenAddress: string;
  receiverAddress: string;
  endDate: Date;
}> = ({
  network,
  senderAddress,
  receiverAddress,
  superTokenAddress,
  endDate,
}) => {
  const { data: streamSchedulerPermissions } =
    rpcApi.useStreamSchedulerPermissionsQuery({
      senderAddress,
      superTokenAddress,
      chainId: network.id,
    });

  const [
    updateStreamSchedulerPermissions,
    updateStreamSchedulerPermissionsResult,
  ] = rpcApi.useUpdateStreamSchedulerPermissionsMutation();

  const [scheduleEndDate, scheduleEndDateResult] =
    rpcApi.useScheduleStreamEndDateMutation();

  const hasDeletePermission = streamSchedulerPermissions
    ? Number(streamSchedulerPermissions.permissions) > 3
    : false;

  return (
    <>
      <TransactionBoundary
        expectedNetwork={network}
        mutationResult={updateStreamSchedulerPermissionsResult}
      >
        {({ getOverrides }) =>
          !hasDeletePermission && (
            <TransactionButton
              onClick={async (signer) => {
                updateStreamSchedulerPermissions({
                  signer,
                  chainId: network.id,
                  flowRateAllowance: "0",
                  permissions: 4,
                  superTokenAddress,
                  waitForConfirmation: false,
                  overrides: await getOverrides(),
                });
              }}
            >
              Give Stream Scheduler Permission To Cancel Streams
            </TransactionButton>
          )
        }
      </TransactionBoundary>
      <TransactionBoundary mutationResult={scheduleEndDateResult}>
        {() =>
          hasDeletePermission && (
            <TransactionButton
              onClick={async (signer) => {
                scheduleEndDate({
                  signer,
                  superTokenAddress,
                  senderAddress,
                  receiverAddress,
                  chainId: network.id,
                  waitForConfirmation: false,
                  endTimestamp: Math.floor(endDate.getTime() / 1000),
                  userData: "0x",
                });
              }}
            >
              Schedule
            </TransactionButton>
          )
        }
      </TransactionBoundary>
    </>
  );
};
