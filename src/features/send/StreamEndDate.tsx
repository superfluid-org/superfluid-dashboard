import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { Card, CardProps, Stack, TextField, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { rpcApi } from "../redux/store";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { Network } from "../network/networks";
import { TransactionButton } from "../transactionBoundary/TransactionButton";

const StreamEndDate: FC<{
  CardProps: CardProps;
  network: Network;
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
}> = ({
  CardProps,
  network,
  superTokenAddress,
  senderAddress,
  receiverAddress,
}) => {
  const chainId = network.id;

  const { data: streamSchedulerPermissions } =
    rpcApi.useStreamSchedulerPermissionsQuery({
      chainId,
      senderAddress,
      superTokenAddress,
    });

  const [
    updateStreamSchedulerPermissions,
    updateStreamSchedulerPermissionsResult,
  ] = rpcApi.useUpdateStreamSchedulerPermissionsMutation();

  const [
    revokeStreamSchedulerPermissions,
    revokeStreamSchedulerPermissionsResult,
  ] = rpcApi.useRevokeAllStreamSchedulerPermissionsMutation();

  const { data: scheduledEndDate } = rpcApi.useStreamScheduledEndDateQuery({
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
    <Card {...CardProps}>
      <Stack sx={{ display: "block" }} spacing={1}>
        <Typography variant="h3" component="h2" sx={{ mb: 1 }}>
          Stream Scheduling
        </Typography>
        {streamSchedulerPermissions && (
          <>
            {/* TODO(KK): Remove this part */}
            {/* <Typography>Stream Scheduler Permissions</Typography>
          <Typography>
            Flow Operator ID: {streamSchedulerPermissions.flowOperatorId}
          </Typography>
          <Typography>
            Flow Rate Allowance: {streamSchedulerPermissions.flowRateAllowance}
          </Typography>
          <Typography>
            Permissions: {streamSchedulerPermissions.permissions}
          </Typography> */}

            {/* TODO(KK): Add expected address? */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                renderInput={(props) => <TextField fullWidth {...props} />}
                label="End Date"
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                }}
              />
            </LocalizationProvider>
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
            <TransactionBoundary
              expectedNetwork={network}
              mutationResult={revokeStreamSchedulerPermissionsResult}
            >
              {({ getOverrides }) =>
                hasDeletePermission && (
                  <TransactionButton
                    ButtonProps={{
                      variant: "outlined",
                    }}
                    onClick={async (signer) => {
                      revokeStreamSchedulerPermissions({
                        signer,
                        chainId: network.id,
                        superTokenAddress,
                        waitForConfirmation: false,
                        overrides: await getOverrides(),
                      });
                    }}
                  >
                    Revoke All Stream Scheduler Permissions
                  </TransactionButton>
                )
              }
            </TransactionBoundary>
          </>
        )}
        <TransactionBoundary mutationResult={scheduleEndDateResult}>
          {() => (
            <TransactionButton
              disabled={
                !hasDeletePermission ||
                !endDate ||
                Math.floor(endDate.getTime() / 1000) === scheduledEndDate
              }
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
        <Typography variant="body2" sx={{ mt: 3 }}>
          <ul>
            <li> only works when modifying</li>
            <li> no validation</li>
            <li> not visible in list views</li>
            <li> not batchable with creation</li>
            <li> no activity history</li>
          </ul>
        </Typography>
      </Stack>
    </Card>
  );
};

export default StreamEndDate;
