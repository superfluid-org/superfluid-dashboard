import { Button } from "@mui/material";
import { FC } from "react";
import { useNetworkContext } from "../contexts/NetworkContext";
import { useWalletContext } from "../contexts/WalletContext";

const ConnectWallet: FC = () => {
  const { network } = useNetworkContext();
  const { walletChainId: chainId, walletProvider: provider, connect } = useWalletContext();

  return (
    <>
      {provider ? (
        <Button variant="outlined" disabled>
          {(network.chainId !== chainId) ? "Wrong network" : "Connected"} 
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
