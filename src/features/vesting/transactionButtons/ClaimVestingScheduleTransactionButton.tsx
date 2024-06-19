import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import { rpcApi } from "../../redux/store";
import { useConnectionBoundary } from "../../transactionBoundary/ConnectionBoundary";
import {
  TransactionBoundary,
  TransactionBoundaryProps,
} from "../../transactionBoundary/TransactionBoundary";
import {
  TransactionButton,
  TransactionButtonProps,
} from "../../transactionBoundary/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../../transactionBoundary/TransactionDialog";
import NextLink from "next/link";
import { Typography } from "@mui/material";
import { useAnalytics } from "../../analytics/useAnalytics";
import { usePendingVestingScheduleClaim } from "../../pendingUpdates/PendingVestingScheduleClaim";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";

export const ClaimVestingScheduleTransactionButton: FC<{
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  TransactionBoundaryProps?: TransactionBoundaryProps;
  TransactionButtonProps?: Partial<TransactionButtonProps>;
}> = ({
  superTokenAddress,
  senderAddress,
  receiverAddress,
  TransactionBoundaryProps,
  TransactionButtonProps = {},
}) => {
    const { txAnalytics } = useAnalytics();
    const [claimVestingSchedule, claimVestingScheduleResult] =
      rpcApi.useClaimVestingScheduleMutation();

    const { expectedNetwork: network } = useConnectionBoundary();

    const { visibleAddress } = useVisibleAddress();

    const isSender = visibleAddress && senderAddress.toLowerCase() === visibleAddress.toLowerCase();
    const isReceiver = visibleAddress && receiverAddress.toLowerCase() === visibleAddress.toLowerCase();
    const isSenderOrReceiverLooking = isSender || isReceiver;

    const { data: activeVestingSchedule } =
      rpcApi.useGetActiveVestingScheduleQuery(
        isSenderOrReceiverLooking
          ? {
            chainId: network.id,
            superTokenAddress,
            receiverAddress,
            senderAddress,
          }
          : skipToken
      );

    const isBeingClaimed = !!usePendingVestingScheduleClaim({
      chainId: network.id,
      superTokenAddress,
      receiverAddress,
      senderAddress,
    });

    const isButtonVisible = !!activeVestingSchedule?.claimValidityDate;
    const isClaimEnabled = !!activeVestingSchedule?.isClaimable;

    const { ButtonProps = {}, ...RestTxButtonProps } = TransactionButtonProps;

    return (
      <TransactionBoundary
        {...TransactionBoundaryProps}
        mutationResult={claimVestingScheduleResult}
      >
        {({ getOverrides, setDialogLoadingInfo, setDialogSuccessActions }) =>
          isButtonVisible && (
            <TransactionButton
              {...RestTxButtonProps}
              dataCy={"delete-schedule-button"}
              disabled={isClaimEnabled}
              loading={isBeingClaimed}
              ButtonProps={{
                color: "primary",
                size: "medium",
                variant: isReceiver ? "contained" : "outlined",
                fullWidth: false,
                // TODO: What icon to use?
                ...ButtonProps,
              }}
              onClick={async (signer) => {
                setDialogLoadingInfo(
                  <Typography variant="h5" color="text.secondary" translate="yes">
                    { isSender ? "You are claiming the vesting schedule on behalf of the receiver." : "You are claiming the vesting schedule."}
                  </Typography>
                );

                const primaryArgs = {
                  chainId: network.id,
                  superTokenAddress: superTokenAddress,
                  senderAddress: senderAddress,
                  receiverAddress: receiverAddress,
                };
                claimVestingSchedule({
                  ...primaryArgs,
                  signer,
                  overrides: await getOverrides()
                })
                  .unwrap()
                  .then(...txAnalytics("Claim Vesting Schedule", primaryArgs))
                  .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.

                setDialogSuccessActions(
                  <TransactionDialogActions>
                    <NextLink href="/vesting" passHref legacyBehavior>
                      <TransactionDialogButton
                        data-cy={"ok-button"}
                        color="primary"
                      >
                        OK
                      </TransactionDialogButton>
                    </NextLink>
                  </TransactionDialogActions>
                );
              }}
            >
              Claim
            </TransactionButton>
          )
        }
      </TransactionBoundary>
    );
  };
