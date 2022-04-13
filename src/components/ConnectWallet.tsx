import { Button, Stack, Typography } from "@mui/material";
import { FC, useMemo } from "react";
import { useNetworkContext } from "../contexts/NetworkContext";
import { useWalletContext } from "../contexts/WalletContext";
import shortenAddress from "../shortenAddress";

const ConnectWallet: FC = () => {
  const { network } = useNetworkContext();
  const { walletAddress, walletChainId, walletProvider, connect } =
    useWalletContext();

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
        <Button variant="outlined" onClick={connect}>
          Connect
        </Button>
      )}
    </>
  );
};

export default ConnectWallet;
