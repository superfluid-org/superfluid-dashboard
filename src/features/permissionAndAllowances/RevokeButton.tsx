
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

interface RevokeButtonProps {
    network: Network;
    tokenAddress: string;
    operatorAddress: string;
    updatedTokenAllowance: BigNumber;
    updatedFlowOperatorPermissions: number; // Usually 5 (Create or Delete) https://docs.superfluid.finance/superfluid/developers/constant-flow-agreement-cfa/cfa-access-control-list-acl/acl-features
    updatedFlowRateAllowance: BigNumber;
  }
  
  const RevokeButton: FC<RevokeButtonProps> = ({
    network,
    tokenAddress,
    operatorAddress,
  }) => {
    const { txAnalytics } = useAnalytics();
    const [revokeAccess, revokeAccessResult] = rpcApi.useRevokeAccessMutation();
  
    const theme = useTheme();

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
  