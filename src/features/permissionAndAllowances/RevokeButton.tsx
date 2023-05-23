
import { Typography, alpha, useTheme } from "@mui/material";
import { Signer } from "@wagmi/core";
import { FC, ReactNode, useCallback } from "react";
import { Network } from "../network/networks";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { useAnalytics } from "../analytics/useAnalytics";
import { rpcApi } from "../redux/store";
import { PermissionAndAllowancesProps } from "./PermissionAndAllowancesRow";

interface RevokeButtonProps {
  network: Network;
  tokenAddress: string;
  operatorAddress: string;
  permissionAndAllowances: PermissionAndAllowancesProps
}

const RevokeButton: FC<RevokeButtonProps> = ({
  network,
  tokenAddress,
  operatorAddress,
  permissionAndAllowances,
}) => {

  const { txAnalytics } = useAnalytics();
  const [revokePermissionAndAllowances, revokePermissionAndAllowancesResult] = rpcApi.useRevokePermissionAndAllowancesMutation();

  const theme = useTheme();

  const onRevokeAccess = useCallback(
    async (
      signer: Signer,
      setDialogLoadingInfo: (children: ReactNode) => void
    ) => {
      setDialogLoadingInfo(
        <Typography variant="h5" color="text.secondary" translate="yes">
          Permissions & Allowances to the token is being revoked.
        </Typography>
      );

      const primaryArgs = {
        chainId: network.id,
        superTokenAddress: tokenAddress,
        operatorAddress: operatorAddress,
        permissionAndAllowances: permissionAndAllowances,
      };

      revokePermissionAndAllowances({
        ...primaryArgs,
        signer,
      })
        .unwrap()
        .then(...txAnalytics("Revoked Permissions & Allowances", primaryArgs))
        .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
    },
    [
      revokePermissionAndAllowances,
      permissionAndAllowances,
      txAnalytics,
      network,
      tokenAddress,
      operatorAddress,
    ]
  );

  const isRevokeAllowed = permissionAndAllowances.flowOperatorPermissions !== 0 || permissionAndAllowances.tokenAllowance.gt(0) || permissionAndAllowances.flowRateAllowance.amountEther.gt(0);
  
  if (!isRevokeAllowed) {
    return null;
  }

  return (
    <TransactionBoundary mutationResult={revokePermissionAndAllowancesResult}>
      {({ setDialogLoadingInfo }) => (
        <TransactionButton
          ButtonProps={{
            size: "medium",
            fullWidth: true,
            variant: "contained",
            sx: {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              "&:hover": {
                color: theme.palette.common.white,
              },
            }
          }}
          onClick={(signer) => onRevokeAccess(signer, setDialogLoadingInfo)}
        >
          Revoke
        </TransactionButton>
      )}
    </TransactionBoundary>
  );
};

export default RevokeButton;
