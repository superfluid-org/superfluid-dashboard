import { Typography } from "@mui/material";
import { FC, useEffect } from "react";
import { Network } from "../network/networks";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { useAnalytics } from "../analytics/useAnalytics";
import { rpcApi } from "../redux/store";
import { TokenAccessProps } from "./dialog/UpsertTokenAccessForm";
import { calculateTotalAmountWei } from "../send/FlowRateInput";

interface RevokeButtonProps {
  network: Network;
  tokenAddress: string;
  operatorAddress: string;
  access: TokenAccessProps;
  onRevokeButtonClick: () => void;
}

const RevokeButton: FC<RevokeButtonProps> = ({
  network,
  tokenAddress,
  operatorAddress,
  access,
  onRevokeButtonClick,
}) => {
  const { txAnalytics } = useAnalytics();
  const [revoke, revokeResult] = rpcApi.useRevokeAccessMutation();

  // TODO(KK): What is this for?
  useEffect(() => {
    if (revokeResult.status === "fulfilled") {
      onRevokeButtonClick();
    }
  }, [revokeResult]);

  const isRevokeAllowed =
    access.flowOperatorPermissions !== 0 ||
    access.tokenAllowanceWei.gt(0) ||
    access.flowRateAllowance.amountWei.gt(0);

  return (
    <TransactionBoundary mutationResult={revokeResult}>
      {({ setDialogLoadingInfo }) => (
        <TransactionButton
          ConnectionBoundaryButtonProps={{
            impersonationTitle: "Stop viewing",
            changeNetworkTitle: "Change Network",
          }}
          ButtonProps={{
            disabled: isRevokeAllowed,
            size: "large",
            fullWidth: true,
            variant: "outlined",
          }}
          // TODO(KK): better title?
          onClick={async (signer) => {
            setDialogLoadingInfo(
              <Typography variant="h5" color="text.secondary" translate="yes">
                Permissions & Allowances to the token is being revoked.
              </Typography>
            );

            const primaryArgs = {
              chainId: network.id,
              superTokenAddress: tokenAddress,
              operatorAddress: operatorAddress,
              initialAccess: {
                flowRateAllowanceWei: calculateTotalAmountWei(access.flowRateAllowance).toString(),
                flowOperatorPermissions: access.flowOperatorPermissions,
                tokenAllowanceWei: access.toString()
              },
            };

            revoke({
              ...primaryArgs,
              signer,
            })
              .unwrap()
              .then(
                ...txAnalytics("Revoked Permissions & Allowances", primaryArgs)
              )
              .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
          }}
        >
          Revoke
        </TransactionButton>
      )}
    </TransactionBoundary>
  );
};

export default RevokeButton;
