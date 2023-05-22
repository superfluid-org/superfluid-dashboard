import { Network } from "../../network/networks";
import { Typography } from "@mui/material";
import { Signer } from "@wagmi/core";
import { FC, ReactNode, useCallback } from "react";
import { useAnalytics } from "../../analytics/useAnalytics";
import { rpcApi } from "../../redux/store";
import { TransactionBoundary } from "../../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../../transactionBoundary/TransactionButton";

interface DisableAutoWrapBtnProps {
    network: Network;
    tokenAddress: string;
    senderAddress: string;
  }
  
  const DisableAutoWrapBtn: FC<DisableAutoWrapBtnProps> = ({
    network,
    tokenAddress,
    senderAddress,
  }) => {
    const { txAnalytics } = useAnalytics();
    const [fixAccess, fixAccessResult] = rpcApi.useFixAccessForVestingMutation();
  
    const onFixAccess = useCallback(
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
            You are fixing access for the vesting smart contract so that it could
            be correctly executed.
          </Typography>
        );
  
        const primaryArgs = {
          chainId: network.id,
          superTokenAddress: tokenAddress,
          senderAddress: senderAddress,
        };
  
        fixAccess({
          ...primaryArgs,
          signer,
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
        senderAddress
      ]
    );
  
    return (
      <TransactionBoundary mutationResult={fixAccessResult}>
        {({ setDialogLoadingInfo }) => (
          <TransactionButton
            ButtonProps={{
              size: "medium",
              fullWidth: false,
              variant: "contained",
            }}
            onClick={(signer) => onFixAccess(signer, setDialogLoadingInfo)}
          >
            Enable
          </TransactionButton>
        )}
      </TransactionBoundary>
    );
  };
  
  export default DisableAutoWrapBtn;
  