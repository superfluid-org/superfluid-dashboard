import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
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
import { useVisibleAddress } from "../wallet/VisibleAddressContext";

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

  const isVisible = !!existingVestingSchedule;

  return (
    <TransactionBoundary
      {...TransactionBoundaryProps}
      mutationResult={deleteVestingScheduleResult}
    >
      {({ getOverrides }) =>
        isVisible && (
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
                receiverAddress: receiverAddress,
                superTokenAddress: superTokenAddress,
                transactionExtraData: undefined,
                overrides: await getOverrides(),
                waitForConfirmation: false,
              });
            }}
          >
            Delete Vesting Schedule
          </TransactionButton>
        )
      }
    </TransactionBoundary>
  );
};
