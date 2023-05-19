
import { Typography } from "@mui/material";
import { Signer } from "@wagmi/core";
import { BigNumber } from "ethers";
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
    permissionsAndAllowances: PermissionAndAllowancesProps;
  }
  
  const SaveButton: FC<SaveButtonProps> = ({
    network,
    tokenAddress,
    operatorAddress,
    permissionsAndAllowances
  }) => {
    const { txAnalytics } = useAnalytics();
    const [revokeAccess, revokeAccessResult] = rpcApi.useRevokeAccessMutation();
  
    const onRevokeAccess = useCallback(
      async (
        signer: Signer,
        setDialogLoadingInfo: (children: ReactNode) => void
      ) => {
        if (!network.vestingContractAddress) {
          throw new Error(
            "No vesting contract configured for network. Should never happen!"
          );
        }
  
        setDialogLoadingInfo(
          <Typography variant="h5" color="text.secondary" translate="yes">
            Access to the token is being revoked.
          </Typography>
        );
  
        const primaryArgs = {
          chainId: network.id,
          superTokenAddress: tokenAddress,
          operatorAddress: operatorAddress,
        };
  
        revokeAccess({
          ...primaryArgs,
          signer,
          waitForConfirmation: false,
        })
          .unwrap()
          .then(...txAnalytics("Revoked Access", primaryArgs))
          .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
      },
      [
        revokeAccess,
        txAnalytics,
        network,
        tokenAddress,
        operatorAddress,
      ]
    );
  
    return (
      <TransactionBoundary mutationResult={revokeAccessResult}>
        {({ setDialogLoadingInfo }) => (
          <TransactionButton
            ButtonProps={{
              size: "small",
              fullWidth: false,
              variant: "contained",
            }}
            onClick={(signer) => onRevokeAccess(signer, setDialogLoadingInfo)}
            disabled={!(permissionsAndAllowances.hasErc20AllowanceChanged || permissionsAndAllowances.hasStreamAllowanceChanged || permissionsAndAllowances.hasStreamPermissionsChanged)}
          >
            Save Changes
          </TransactionButton>
        )}
      </TransactionBoundary>
    );
  };
  
  export default SaveButton;
  