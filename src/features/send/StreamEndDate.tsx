import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Card, TextField, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { rpcApi } from "../redux/store";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { Network } from "../network/networks";
import { TransactionButton } from "../transactionBoundary/TransactionButton";

const StreamEndDate: FC<{
  network: Network;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}> = ({ network, superTokenAddress, senderAddress, receiverAddress }) => {
  const chainId = network.id;

  const { data: streamSchedulerPermissions } =
    rpcApi.useGetStreamSchedulerPermissionsQuery({
      chainId,
      senderAddress,
      superTokenAddress,
    });

  const [
    updateStreamSchedulerPermissions,
    updateStreamSchedulerPermissionsResult,
  ] = rpcApi.useUpdateStreamSchedulerPermissionsMutation();

  const { data: scheduledEndDate } =
    rpcApi.useGetNextStreamScheduledEndDateQuery({
      chainId,
      senderAddress,
      superTokenAddress,
      receiverAddress,
    });

  // TODO(KK): Don't really like the useEffect solution here.
  useEffect(() => {
    if (scheduledEndDate) {
      setEndDate(new Date(scheduledEndDate * 1000));
    }
  }, [scheduledEndDate]);

  const [scheduleEndDate, scheduleEndDateResult] =
    rpcApi.useScheduleStreamEndDateMutation();

  const [endDate, setEndDate] = useState<Date | null>(null);

  // TODO(KK): use more logical bitmask operation
  const hasDeletePermission = streamSchedulerPermissions
    ? Number(streamSchedulerPermissions.permissions) > 3
    : false;

  return (
    <Card>
      {streamSchedulerPermissions && (
        <>
          <Typography>Stream Scheduler Permissions</Typography>
          <Typography>
            Flow Operator ID: {streamSchedulerPermissions.flowOperatorId}
          </Typography>
          <Typography>
            Flow Rate Allowance: {streamSchedulerPermissions.flowRateAllowance}
          </Typography>
          <Typography>
            Permissions: {streamSchedulerPermissions.permissions}
          </Typography>
          {/* TODO(KK): Add expected address? */}
          <TransactionBoundary
            expectedNetwork={network}
            mutationResult={updateStreamSchedulerPermissionsResult}
          >
            {
              ({ getOverrides }) =>
                !hasDeletePermission && (
                  <TransactionButton
                    onClick={async (signer) => {
                      updateStreamSchedulerPermissions({
                        signer,
                        chainId: network.id,
                        flowRateAllowance: "0",
                        permissions: 4,
                        superTokenAddress: superTokenAddress,
                        waitForConfirmation: false,
                        overrides: await getOverrides(),
                      });
                    }}
                  >
                    Give Stream Scheduler Permission To Cancel Streams
                  </TransactionButton>
                )
              // TODO(KK): Make it possible to revoke permissions.
            }
          </TransactionBoundary>
        </>
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          renderInput={(props) => <TextField {...props} />}
          label="End Date"
          value={endDate}
          onChange={(newValue) => {
            setEndDate(newValue);
          }}
        />
      </LocalizationProvider>
      <TransactionBoundary mutationResult={scheduleEndDateResult}>
        {() => (
          <TransactionButton
            disabled={!endDate || (Math.floor(endDate.getTime() / 1000)) === scheduledEndDate}
            onClick={async (signer) => {
              if (!endDate) throw new Error();

              scheduleEndDate({
                signer,
                chainId,
                superTokenAddress,
                senderAddress,
                receiverAddress,
                waitForConfirmation: false,
                endTimestamp: Math.floor(endDate.getTime() / 1000),
                userData: "0x",
              });
            }}
          >
            Schedule End Date
          </TransactionButton>
        )}
      </TransactionBoundary>
    </Card>
  );
};

export default StreamEndDate;
