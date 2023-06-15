import { Button, ButtonProps } from "@mui/material";
import { FC, memo } from "react";
import { useConnectionBoundary } from "../../transactionBoundary/ConnectionBoundary";
import { LoadingButton } from "@mui/lab";

const EnableAutoWrapButton: FC<{ ButtonProps?: ButtonProps, openEnableAutoWrapDialog: () => void }> = ({ ButtonProps = {}, openEnableAutoWrapDialog }) => {
    
  const {
      allowImpersonation,
      isImpersonated,
      stopImpersonation,
      isConnected,
      isConnecting,
      connectWallet,
      isCorrectNetwork,
      switchNetwork,
    } = useConnectionBoundary();
  
    if (isImpersonated && !allowImpersonation) {
      return (
        <Button
          data-cy={"view-mode-button"}
          {...ButtonProps}
          color="warning"
          onClick={stopImpersonation}
        >
          Stop viewing
        </Button>
      );
    }
  
    if (!(isConnected || (isImpersonated && allowImpersonation))) {
      return (
        <LoadingButton
          data-cy={"connect-wallet-button"}
          {...ButtonProps}
          loading={isConnecting}
          color="primary"
          onClick={connectWallet}
        >
          <span>Connect Wallet</span>
        </LoadingButton>
      );
    }
  
    if (!isCorrectNetwork && !allowImpersonation) {
      return (
        <Button
          data-cy={"change-network-button"}
          {...ButtonProps}
          color="primary"
          disabled={!switchNetwork}
          onClick={() => switchNetwork?.()}
        >
          <span translate="no">
            Change Network
          </span>
        </Button>
      );
    }
  
    return <Button
      fullWidth={true}
      data-cy={"enable-auto-wrap-button"}
      variant="contained"
      size="medium"
      onClick={openEnableAutoWrapDialog}
      {...ButtonProps || {}}
    >
      Enable
    </Button>
  }

  export default memo(EnableAutoWrapButton);
