import { Typography } from "@mui/material";
import { Signer } from "@wagmi/core";
import { Overrides } from "ethers";
import { FC, ReactNode, useCallback } from "react";
import { Network } from "../network/networks";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { useAnalytics } from "../analytics/useAnalytics";
import { rpcApi } from "../redux/store";
import { TokenAccessProps } from "./TokenAccessRow";

interface SaveButtonProps {
  network: Network;
  tokenAddress: string;
  operatorAddress: string;
  initialAccess: TokenAccessProps;
  editedAccess: TokenAccessProps;
}

const SaveButton: FC<SaveButtonProps> = ({
  network,
  tokenAddress,
  operatorAddress,
  initialAccess,
  editedAccess,
}) => {
  const { txAnalytics } = useAnalytics();
  const [updateAccess, updateAccessResult] = rpcApi.useUpdateAccessMutation();

  const onUpdate = useCallback(
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
        initialAccess,
        editedAccess: editedAccess,
      };

      updateAccess({
        ...primaryArgs,
        signer,
        overrides: await getOverrides(),
      })
        .unwrap()
        .then(...txAnalytics("Updated Permissions & Allowances", primaryArgs))
        .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
    },
    [
      updateAccess,
      initialAccess,
      editedAccess,
      txAnalytics,
      network,
      tokenAddress,
      operatorAddress,
    ]
  );

  const isEdited =
    initialAccess.flowOperatorPermissions !==
      editedAccess.flowOperatorPermissions ||
    !initialAccess.tokenAllowance.eq(editedAccess.tokenAllowance) ||
    !initialAccess.flowRateAllowance.amountEther.eq(
      editedAccess.flowRateAllowance.amountEther
    ) ||
    initialAccess.flowRateAllowance.unitOfTime !==
      editedAccess.flowRateAllowance.unitOfTime;

  return (
    <TransactionBoundary mutationResult={updateAccessResult}>
      {({ setDialogLoadingInfo, getOverrides }) => (
        <TransactionButton
          ButtonProps={{
            size: "medium",
            fullWidth: true,
            variant: "contained",
          }}
          onClick={(signer) =>
            onUpdate(signer, setDialogLoadingInfo, getOverrides)
          }
          disabled={!isEdited}
        >
          Save Changes
        </TransactionButton>
      )}
    </TransactionBoundary>
  );
};

export default SaveButton;
