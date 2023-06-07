import { Typography } from "@mui/material";
import { Signer } from "@wagmi/core";
import { Overrides } from "ethers";
import { FC, ReactNode, useCallback } from "react";
import { Network } from "../network/networks";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { useAnalytics } from "../analytics/useAnalytics";
import { rpcApi } from "../redux/store";
import { TokenAccessProps } from "./dialogs/UpsertTokenAccessForm";

interface SaveButtonProps {
  network: Network | undefined;
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
  disabled,
  title = "Save changes",
}) => {
  const { txAnalytics } = useAnalytics();
  const [updateAccess, updateAccessResult] = rpcApi.useUpdateAccessMutation();

  const onUpdate = useCallback(
    async (
      network: Network,
      signer: Signer,
      tokenAddress: string,
      setDialogLoadingInfo: (children: ReactNode) => void,
      getOverrides: () => Promise<Overrides>
    ) => {
      setDialogLoadingInfo(
        <Typography variant="h5" color="text.secondary" translate="yes">
          Updating token permissions & allowances
        </Typography>
      );

      const primaryArgs = {
        chainId: network.id,
        superTokenAddress: tokenAddress,
        operatorAddress: operatorAddress,
        initialAccess,
        editedAccess: editedAccess,
      };

      updateAccess({
        ...primaryArgs,
        signer,
        overrides: await getOverrides(),
      })
        .unwrap()
        .then(...txAnalytics("Updated Permissions & Allowances", primaryArgs))
        .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
    },
    [
      disabled,
      updateAccess,
      initialAccess,
      editedAccess,
      txAnalytics,
      network,
      tokenAddress,
      operatorAddress,
    ]
  );

  const _isDisabled =
    disabled || network === undefined || tokenAddress === undefined;

  return (
    <TransactionBoundary mutationResult={updateAccessResult}>
      {({ setDialogLoadingInfo, getOverrides }) => (
        <TransactionButton
          ConnectionBoundaryButtonProps={{
            impersonationTitle: "Stop viewing",
            changeNetworkTitle: "Change Network",
          }}
          ButtonProps={{
            size: "large",
            fullWidth: true,
            variant: "contained",
          }}
          onClick={async (signer) =>
            !_isDisabled
              ? await onUpdate(
                  network,
                  signer,
                  tokenAddress,
                  setDialogLoadingInfo,
                  getOverrides
                )
              : void 0
          }
          disabled={_isDisabled}
        >
          {title}
        </TransactionButton>
      )}
    </TransactionBoundary>
  );
};

export default SaveButton;
