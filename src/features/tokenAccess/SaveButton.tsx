import { Typography } from "@mui/material";
import { FC } from "react";
import { Network } from "../network/networks";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { rpcApi } from "../redux/store";
import { TokenAccessProps } from "./dialog/UpsertTokenAccessForm";

interface SaveButtonProps {
  network: Network | null;
  tokenAddress: string | undefined;
  operatorAddress: string;
  initialAccess: TokenAccessProps;
  editedAccess: TokenAccessProps;
  disabled: boolean;
  title: string;
}

const SaveButton: FC<SaveButtonProps> = ({
  network,
  tokenAddress,
  operatorAddress,
  initialAccess,
  editedAccess,
  disabled: disabled_,
  title = "Save changes",
}) => {
  const [updateAccess, updateAccessResult] = rpcApi.useUpdateAccessMutation();

  const isDisabled =
    disabled_ || !network || !tokenAddress;

  return (
    <TransactionBoundary mutationResult={updateAccessResult}>
      {({ setDialogLoadingInfo, getOverrides, txAnalytics }) => (
        <TransactionButton
          disabled={isDisabled}
          ConnectionBoundaryButtonProps={{
            impersonationTitle: "Stop viewing",
            changeNetworkTitle: "Change Network",
          }}
          ButtonProps={{
            size: "large",
            fullWidth: true,
            variant: "contained",
          }}
          onClick={async (signer) => {
            if (isDisabled) {
              throw new Error(
                "This should never happen as the button should be disabled."
              );
            }

            setDialogLoadingInfo(
              <Typography variant="h5" color="text.secondary" translate="yes">
                Updating token permissions & allowances
              </Typography>
            );

            const primaryArgs = {
              chainId: network.id,
              superTokenAddress: tokenAddress,
              operatorAddress: operatorAddress,
              initialAccess: {
                flowRateAllowanceWei: initialAccess.flowRateAllowance.amountWei.toString(),
                flowOperatorPermissions: initialAccess.flowOperatorPermissions,
                tokenAllowanceWei: initialAccess.tokenAllowanceWei.toString(),
              },
              editedAccess: {
                flowRateAllowanceWei: editedAccess.flowRateAllowance.amountWei.toString(),
                flowOperatorPermissions: editedAccess.flowOperatorPermissions,
                tokenAllowanceWei: editedAccess.tokenAllowanceWei.toString(),
              }
            };

            updateAccess({
              ...primaryArgs,
              signer,
              overrides: await getOverrides(),
            })
              .unwrap()
              .then(
                ...txAnalytics("Updated Permissions & Allowances", primaryArgs)
              )
              .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
          }}
        >
          {title}
        </TransactionButton>
      )}
    </TransactionBoundary>
  );
};

export default SaveButton;
