import { Stack, Typography } from "@mui/material";
import { FC } from "react";
import { Network } from "../network/networks";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { useUpdateAccess } from "./useTokenAccessWrites";
import { TokenAccessProps } from "./dialog/UpsertTokenAccessForm";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { ClearMacroRelayOption } from "../clearMacro/ClearMacroRelayOption";

interface SaveButtonProps {
  network: Network | null;
  superToken: SuperTokenMinimal | null;
  operatorAddress: string;
  initialAccess: TokenAccessProps;
  editedAccess: TokenAccessProps;
  disabled: boolean;
  title: string;
  onSuccessCallback: () => void;
}

const SaveButton: FC<SaveButtonProps> = ({
  network,
  superToken,
  operatorAddress,
  initialAccess,
  editedAccess,
  disabled: disabled_,
  title = "Save changes",
  onSuccessCallback,
}) => {
  const [updateAccess, updateAccessResult] = useUpdateAccess();

  const isDisabled =
    disabled_ || !network || !superToken;

  // The macro relay handles only a lone super-token allowance change — any
  // permissions/flow-rate-allowance change adds an ACL operation (multi-op batch).
  const onlyAllowanceChanged =
    initialAccess.tokenAllowanceWei.toString() !==
      editedAccess.tokenAllowanceWei.toString() &&
    initialAccess.flowOperatorPermissions ===
      editedAccess.flowOperatorPermissions &&
    initialAccess.flowRateAllowance.amountWei.toString() ===
      editedAccess.flowRateAllowance.amountWei.toString();

  return (
    <Stack gap={1}>
      {network && (
        <ClearMacroRelayOption
          actionKind={onlyAllowanceChanged ? "approve" : undefined}
          network={network}
        />
      )}
      <TransactionBoundary mutationResult={updateAccessResult}>
        {({ setDialogLoadingInfo, txAnalytics }) => (
          <TransactionButton
            dataCy={"approvals-save-button"}
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
            onClick={async () => {
              if (isDisabled) {
                throw new Error(
                  "This should never happen as the button should be disabled."
                );
              }

              setDialogLoadingInfo(
                <Typography variant="h5" color="text.secondary" translate="yes">
                  You are modifying permissions and allowances for the {superToken.symbol} token.
                </Typography>
              );

              const primaryArgs = {
                chainId: network.id,
                superTokenAddress: superToken.address,
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

              updateAccess(primaryArgs)
                .then(
                  ...txAnalytics("Updated Permissions & Allowances", primaryArgs)
                ).then(onSuccessCallback)
                .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
            }}
          >
            {title}
          </TransactionButton>
        )}
      </TransactionBoundary>
    </Stack>
  );
};

export default SaveButton;
