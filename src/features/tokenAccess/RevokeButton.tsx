import { Typography } from "@mui/material";
import { FC } from "react";
import { Network } from "../network/networks";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { useAnalytics } from "../analytics/useAnalytics";
import { rpcApi } from "../redux/store";
import { calculateTotalAmountWei } from "../send/FlowRateInput";
import { TokenAccessProps } from "./dialog/UpsertTokenAccessForm";

interface RevokeButtonProps {
  network: Network;
  superToken: {
    address: string;
    symbol: string;
  }
  operatorAddress: string;
  access: TokenAccessProps;
}

const RevokeButton: FC<RevokeButtonProps> = ({
  network,
  superToken,
  operatorAddress,
  access,
}) => {
  const { txAnalytics } = useAnalytics();
  const [revoke, revokeResult] = rpcApi.useRevokeAccessMutation();

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
                You are revoking all permissions and allowances for the {superToken.symbol} token.
              </Typography>
            );

            const primaryArgs = {
              chainId: network.id,
              superTokenAddress: superToken.address,
              operatorAddress: operatorAddress,
              initialAccess: {
                flowRateAllowanceWei: calculateTotalAmountWei(access.flowRateAllowance).toString(),
                flowOperatorPermissions: access.flowOperatorPermissions,
                tokenAllowanceWei: access.tokenAllowanceWei.toString()
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
