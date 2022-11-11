import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import { useAddressPendingVestingScheduleDeletes } from "../pendingUpdates/PendingVestingScheduleDelete";
import { rpcApi } from "../redux/store";
import { useConnectionBoundary } from "../transactionBoundary/ConnectionBoundary";
import {
  TransactionBoundary,
  TransactionBoundaryProps,
} from "../transactionBoundary/TransactionBoundary";
import {
  TransactionButton,
  TransactionButtonProps,
} from "../transactionBoundary/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactionBoundary/TransactionDialog";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import Link from "next/link";

export const DeleteVestingTransactionButton: FC<{
  superTokenAddress: string;
  senderAddress: string;
  receiverAddress: string;
  TransactionBoundaryProps?: TransactionBoundaryProps;
  TransactionButtonProps?: TransactionButtonProps;
}> = ({
  superTokenAddress,
  senderAddress,
  receiverAddress,
  TransactionBoundaryProps,
  TransactionButtonProps,
}) => {
  const [deleteVestingSchedule, deleteVestingScheduleResult] =
    rpcApi.useDeleteVestingScheduleMutation();

  const { expectedNetwork: network } = useConnectionBoundary();

  const { visibleAddress } = useVisibleAddress();
  const isSender =
    senderAddress.toLowerCase() === visibleAddress?.toLowerCase();

  const { currentData: existingVestingSchedule } =
    rpcApi.useGetVestingScheduleQuery(
      isSender
        ? {
            chainId: network.id,
            superTokenAddress: superTokenAddress,
            receiverAddress: receiverAddress,
            senderAddress: senderAddress,
          }
        : skipToken
    );

  const pendingDeletes = useAddressPendingVestingScheduleDeletes(senderAddress);
  const isBeingDeleted = pendingDeletes.some(
    (x) =>
      x.chainId === network.id &&
      x.superTokenAddress.toLowerCase() === superTokenAddress.toLowerCase() &&
      x.senderAddress.toLowerCase() === senderAddress.toLowerCase() &&
      x.receiverAddress.toLowerCase() === receiverAddress.toLowerCase()
  );

  console.log({
    isBeingDeleted,
  });

  const isButtonVisible = !!existingVestingSchedule && !isBeingDeleted;

  return (
    <TransactionBoundary
      {...TransactionBoundaryProps}
      mutationResult={deleteVestingScheduleResult}
    >
      {({ getOverrides, setDialogSuccessActions }) =>
        isButtonVisible && (
          <TransactionButton
            {...TransactionButtonProps}
            ButtonProps={{
              variant: "outlined",
              color: "error",
            }}
            onClick={async (signer) => {
              deleteVestingSchedule({
                signer,
                chainId: network.id,
                superTokenAddress: superTokenAddress,
                senderAddress: await signer.getAddress(),
                receiverAddress: receiverAddress,
                transactionExtraData: undefined,
                overrides: await getOverrides(),
                waitForConfirmation: false,
              });

              setDialogSuccessActions(
                <TransactionDialogActions>
                  <Link href="/vesting" passHref>
                    <TransactionDialogButton color="primary">
                      OK
                    </TransactionDialogButton>
                  </Link>
                </TransactionDialogActions>
              );
            }}
          >
            Delete Vesting Schedule
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};
