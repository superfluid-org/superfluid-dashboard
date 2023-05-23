
import { Typography } from "@mui/material";
import { Signer } from "@wagmi/core";
import { BigNumber, Overrides } from "ethers";
import { FC, ReactNode, useCallback } from "react";
import { Network } from "../network/networks";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { useAnalytics } from "../analytics/useAnalytics";
import { rpcApi } from "../redux/store";
import { PermissionAndAllowancesProps } from "./PermissionAndAllowancesRow";

interface SaveButtonProps {
  network: Network;
  tokenAddress: string;
  operatorAddress: string;
  initialPermissionAndAllowances: PermissionAndAllowancesProps
  editedPermissionAndAllowances: PermissionAndAllowancesProps
}

const SaveButton: FC<SaveButtonProps> = ({
  network,
  tokenAddress,
  operatorAddress,
  initialPermissionAndAllowances,
  editedPermissionAndAllowances
}) => {
  const { txAnalytics } = useAnalytics();
  const [updatePermissionAndAllowances, updatePermissionAndAllowancesResult] = rpcApi.useUpdatePermissionAndAllowancesMutation();

  const onUpdatedPermissionAndAllowance = useCallback(
    async (
      signer: Signer,
      setDialogLoadingInfo: (children: ReactNode) => void,
      getOverrides: () => Promise<Overrides>
    ) => {
      setDialogLoadingInfo(
        <Typography variant="h5" color="text.secondary" translate="yes">
          Updating token permissions & allowances
        </Typography>
      );

      const primaryArgs = {
        chainId: network.id,
        superTokenAddress: tokenAddress,
        operatorAddress: operatorAddress,
        initialPermissionAndAllowances: initialPermissionAndAllowances,
        editedPermissionAndAllowances: editedPermissionAndAllowances,
      };

      updatePermissionAndAllowances({
        ...primaryArgs,
        signer,
        overrides: await getOverrides()
      })
        .unwrap()
        .then(...txAnalytics("Updated Permissions & Allowances", primaryArgs))
        .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
    },
    [
      updatePermissionAndAllowances,
      initialPermissionAndAllowances, 
      editedPermissionAndAllowances,
      txAnalytics,
      network,
      tokenAddress,
      operatorAddress,
    ]
  );

  const isEdited = initialPermissionAndAllowances.flowOperatorPermissions !== editedPermissionAndAllowances.flowOperatorPermissions ||
    !initialPermissionAndAllowances.tokenAllowance.eq(editedPermissionAndAllowances.tokenAllowance) ||
    !initialPermissionAndAllowances.flowRateAllowance.amountEther.eq(editedPermissionAndAllowances.flowRateAllowance.amountEther) ||
    initialPermissionAndAllowances.flowRateAllowance.unitOfTime !== editedPermissionAndAllowances.flowRateAllowance.unitOfTime;

  return (
    <TransactionBoundary mutationResult={updatePermissionAndAllowancesResult}>
      {({ setDialogLoadingInfo, getOverrides }) => (
        <TransactionButton
          ButtonProps={{
            size: "medium",
            fullWidth: true,
            variant: "contained",
          }}
          onClick={(signer) => onUpdatedPermissionAndAllowance(signer, setDialogLoadingInfo, getOverrides)}
          disabled={!isEdited}
        >
          Save Changes
        </TransactionButton>
      )}
    </TransactionBoundary>
  );
};

export default SaveButton;
