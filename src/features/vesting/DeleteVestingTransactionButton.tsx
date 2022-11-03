import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import { useFormContext } from "react-hook-form";
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
import { PartialVestingForm } from "./CreateVestingFormProvider";

export const DeleteVestingTransactionButton: FC<{
  TransactionBoundaryProps?: TransactionBoundaryProps;
  TransactionButtonProps?: TransactionButtonProps;
}> = ({ TransactionBoundaryProps, TransactionButtonProps }) => {
  const [deleteVestingSchedule, deleteVestingScheduleResult] =
    rpcApi.useDeleteVestingScheduleMutation();

  const { watch } = useFormContext<PartialVestingForm>(); // TODO(KK): Scope down.
  const [superTokenAddress, receiverAddress] = watch([
    "data.superTokenAddress",
    "data.receiverAddress",
  ]);

  const { expectedNetwork: network } = useConnectionBoundary();
  const { visibleAddress: senderAddress } = useVisibleAddress();

  const isQueryable = senderAddress && superTokenAddress && receiverAddress;

  const existingVestingSchedule = rpcApi.useGetVestingScheduleQuery(
    isQueryable
      ? {
          chainId: network.id,
          superTokenAddress,
          receiverAddress,
          senderAddress,
        }
      : skipToken
  );

  const isVisible = !!existingVestingSchedule && isQueryable;

  return (
    <TransactionBoundary
      {...TransactionBoundaryProps}
      mutationResult={deleteVestingScheduleResult}
    >
      {({ getOverrides }) =>
        isVisible && (
          <TransactionButton
            {...TransactionButtonProps}
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
