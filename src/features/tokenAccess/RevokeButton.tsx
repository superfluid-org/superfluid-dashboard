import { Typography, alpha, useTheme } from "@mui/material";
import { Signer } from "@wagmi/core";
import { FC, ReactNode, useCallback } from "react";
import { Network } from "../network/networks";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { useAnalytics } from "../analytics/useAnalytics";
import { rpcApi } from "../redux/store";
import { TokenAccessProps } from "./dialogs/ModifyOrAddDialog";

interface RevokeButtonProps {
  network: Network;
  tokenAddress: string;
  operatorAddress: string;
  access: TokenAccessProps;
}

const RevokeButton: FC<RevokeButtonProps> = ({
  network,
  tokenAddress,
  operatorAddress,
  access,
}) => {
  const { txAnalytics } = useAnalytics();
  const [revoke, revokeResult] = rpcApi.useRevokeAccessMutation();

  const theme = useTheme();

  const onRevoke = useCallback(
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
        initialAccess: access,
      };

      revoke({
        ...primaryArgs,
        signer,
      })
        .unwrap()
        .then(...txAnalytics("Revoked Permissions & Allowances", primaryArgs))
        .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
    },
    [revoke, access, txAnalytics, network, tokenAddress, operatorAddress]
  );

  const isRevokeAllowed =
    access.flowOperatorPermissions !== 0 ||
    access.tokenAllowance.gt(0) ||
    access.flowRateAllowance.amountEther.gt(0);

  if (!isRevokeAllowed) {
    return null;
  }

  return (
    <TransactionBoundary mutationResult={revokeResult}>
      {({ setDialogLoadingInfo }) => (
        <TransactionButton
          ConnectionBoundaryButtonProps={{
            impersonationTitle: "Stop viewing",
            changeNetworkTitle: "Change Network",
          }}
          ButtonProps={{
            size: "large",
            fullWidth: true,
            variant: "outlined",
          }}
          onClick={(signer) => onRevoke(signer, setDialogLoadingInfo)}
        >
          Revoke
        </TransactionButton>
      )}
    </TransactionBoundary>
  );
};

export default RevokeButton;
