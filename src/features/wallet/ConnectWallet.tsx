import { Button, CircularProgress, Stack, Typography } from "@mui/material";
import { FC, memo, useMemo } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import { useWalletContext } from "./WalletContext";
import shortenAddress from "../../utils/shortenAddress";
import { LoadingButton } from "@mui/lab";

export default memo(function ConnectWallet() {
  const { network } = useNetworkContext();
  const {
    walletAddress,
    walletChainId,
    walletProvider,
    connectWallet,
    isWalletConnecting,
  } = useWalletContext();

  const shortenedAddress = useMemo(
    () => (walletAddress ? shortenAddress(walletAddress) : ""),
    [walletAddress]
  );

  return (
    <>
      {walletProvider ? (
        <Button
          variant="outlined"
          color={network.chainId !== walletChainId ? "error" : "primary"}
          sx={{
            pointerEvents: "none",
            cursor: "default",
          }}
        >
          <Stack>
            <Typography variant="body2">
              {network.chainId !== walletChainId
                ? "Wrong network"
                : "Connected"}
            </Typography>
            <Typography variant="body2">{shortenedAddress}</Typography>
          </Stack>
        </Button>
      ) : (
        <LoadingButton
          loading={isWalletConnecting}
          variant="outlined"
          onClick={connectWallet}
        >
          Connect
        </LoadingButton>
      )}
    </>
  );
});
