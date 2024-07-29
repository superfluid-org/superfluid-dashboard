import { Typography } from "@mui/material";
import { BigNumber, Signer } from "ethers";
import { FC, ReactNode, useCallback } from "react";
import { useAnalytics } from "../../analytics/useAnalytics";
import { Network } from "../../network/networks";
import { rpcApi } from "../../redux/store";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";

interface FixVestingPermissionsBtnProps {
  network: Network;
  tokenAddress: string;
  senderAddress: string;
  recommendedTokenAllowance: BigNumber;
  requiredFlowOperatorPermissions: number; // Usually 5 (Create or Delete) https://docs.superfluid.finance/superfluid/developers/constant-flow-agreement-cfa/cfa-access-control-list-acl/acl-features
  requiredFlowRateAllowance: BigNumber;
}

const FixVestingPermissionsBtn: FC<FixVestingPermissionsBtnProps> = ({
  network,
  tokenAddress,
  senderAddress,
  recommendedTokenAllowance,
  requiredFlowOperatorPermissions,
  requiredFlowRateAllowance,
}) => {
  const { txAnalytics } = useAnalytics();
  const [fixAccess, fixAccessResult] = rpcApi.useFixAccessForVestingMutation();

  const onFixAccess = useCallback(
    async (
      signer: Signer,
      setDialogLoadingInfo: (children: ReactNode) => void
    ) => {
      if (!network.vestingContractAddress_v1 || network.vestingContractAddress_v2) {
        throw new Error(
          "No vesting contract configured for network. Should never happen!"
        );
      }

      setDialogLoadingInfo(
        <Typography variant="h5" color="text.secondary" translate="yes">
          You are fixing access for the vesting smart contract so that it could
          be correctly executed.
        </Typography>
      );

      const primaryArgs = {
        chainId: network.id,
        superTokenAddress: tokenAddress,
        senderAddress: senderAddress,
        requiredTokenAllowanceWei: recommendedTokenAllowance.toString(),
        requiredFlowOperatorPermissions: requiredFlowOperatorPermissions,
        requiredFlowRateAllowanceWei: requiredFlowRateAllowance.toString(),
        version: "v1" // TODO: handle v2 too
      } as const;

      fixAccess({
        ...primaryArgs,
        signer
      })
        .unwrap()
        .then(...txAnalytics("Fix Access for Vesting", primaryArgs))
        .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
    },
    [
      fixAccess,
      txAnalytics,
      network,
      tokenAddress,
      senderAddress,
      recommendedTokenAllowance,
      requiredFlowOperatorPermissions,
      requiredFlowRateAllowance,
    ]
  );

  return (
    <TransactionBoundary mutationResult={fixAccessResult}>
      {({ setDialogLoadingInfo }) => (
        <TransactionButton
          dataCy="fix-permissions-button"
          ButtonProps={{
            size: "medium",
            fullWidth: false,
            variant: "contained",
          }}
          onClick={(signer) => onFixAccess(signer, setDialogLoadingInfo)}
        >
          Fix Access
        </TransactionButton>
      )}
    </TransactionBoundary>
  );
};

export default FixVestingPermissionsBtn;
