import { Signer } from "ethers";
import { useWalletClient } from "wagmi";
import { signerFromWalletClient } from "../utils/wagmiMigration";
import { useAsyncMemo } from "./useAsyncMemo";

const useSigner = (): Signer | undefined => {
  const { data: walletClient } = useWalletClient();

  return useAsyncMemo(() => {
    if (walletClient) {
      return signerFromWalletClient(walletClient);
    } else {
      return Promise.resolve(undefined);
    }
  }, [walletClient]);
};

export default useSigner;
