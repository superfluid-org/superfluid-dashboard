import { Button } from "@mui/material";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { FC } from "react";
import Web3Modal from "web3modal";
import { useNetworkContext } from "../contexts/NetworkContext";
import { useWalletContext } from "../contexts/WalletContext";

const ConnectWallet: FC = () => {
  const { network } = useNetworkContext();
  const { walletChainId: chainId, walletProvider: provider, setProvider: setWeb3Provider } = useWalletContext();

  const onClick = async () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: "fa4dab2732ac473b9a61b1d1b3b904fa",
        },
      },
    };
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions
    });
    const web3Provider = await web3Modal.connect();
    setWeb3Provider(web3Provider);
  };

  return (
    <>
      {provider ? (
        <Button variant="outlined" disabled>
          {(network.chainId !== chainId) ? "Wrong network" : "Connected"} 
        </Button>
      ) : (
        <Button variant="outlined" onClick={onClick}>
          Connect
        </Button>
      )}
    </>
  );
};

export default ConnectWallet;
