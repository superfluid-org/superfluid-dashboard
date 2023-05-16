
import { Typography } from "@mui/material";
import { Signer } from "@wagmi/core";
import { BigNumber } from "ethers";
import { FC, ReactNode, useCallback } from "react";
import { Network } from "../network/networks";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { useAnalytics } from "../analytics/useAnalytics";
import { rpcApi } from "../redux/store";

interface RevokeAccessBtnProps {
    network: Network;
    tokenAddress: string;
    operatorAddress: string;
  }
  
  const RevokeAccessSettingsBtn: FC<RevokeAccessBtnProps> = ({
    network,
    tokenAddress,
    operatorAddress,
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
              size: "medium",
              fullWidth: false,
              variant: "contained",
            }}
            onClick={(signer) => onRevokeAccess(signer, setDialogLoadingInfo)}
          >
            Revoke
          </TransactionButton>
        )}
      </TransactionBoundary>
    );
  };
  
  export default RevokeAccessSettingsBtn;
  