
import { Typography, alpha } from "@mui/material";
import { Signer } from "@wagmi/core";
import { BigNumber } from "ethers";
import { FC, ReactNode, useCallback } from "react";
import { Network } from "../network/networks";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { useAnalytics } from "../analytics/useAnalytics";
import { rpcApi } from "../redux/store";
import { useTheme } from "@emotion/react";
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

  const isRevokeAllowed = permissionAndAllowances.flowOperatorPermissions !== 0 || permissionAndAllowances.tokenAllowance.gt(0) || permissionAndAllowances.flowRateAllowance.amountEther.gt(0);
  
  if (!isRevokeAllowed) {
    return null;
  }

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
          Access to the token is being revoked.
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
        .then(...txAnalytics("Revoked Access", primaryArgs))
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

  return (
    <TransactionBoundary mutationResult={revokePermissionAndAllowancesResult}>
      {({ setDialogLoadingInfo }) => (
        <TransactionButton
          ButtonProps={{
            size: "small",
            fullWidth: false,
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
