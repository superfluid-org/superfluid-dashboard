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
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useAnalytics } from "../../analytics/useAnalytics";
import { useAccount } from "wagmi";
import { usePendingVestingScheduleClaim } from "../../pendingUpdates/PendingVestingScheduleClaim";

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

  const { address: currentAccountAddress } = useAccount();

  const isSenderOrReceiverLooking =
    currentAccountAddress &&
    (senderAddress.toLowerCase() === currentAccountAddress.toLowerCase() || receiverAddress.toLowerCase() === currentAccountAddress.toLowerCase());

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

  const isButtonVisible = !!activeVestingSchedule && !isBeingClaimed;

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
            ButtonProps={{
              variant: "textContained",
              color: "error",
              size: "medium",
              fullWidth: false,
              startIcon: <CloseRoundedIcon />,
              ...ButtonProps,
            }}
            onClick={async (signer) => {
              setDialogLoadingInfo(
                <Typography variant="h5" color="text.secondary" translate="yes">
                  You are claiming the vesting schedule.
                </Typography>
              );

              const primaryArgs = {
                chainId: network.id,
                superTokenAddress: superTokenAddress,
                senderAddress: await signer.getAddress(),
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
