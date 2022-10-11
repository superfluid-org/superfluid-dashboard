import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { LoadingButton } from "@mui/lab";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAccount, useSwitchNetwork } from "wagmi";
import { addAccountChainTokenFlag, Flag } from "../flags/flags.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useWatchAsset } from "../token/useWatchAsset";
import { useConnectionBoundary } from "../transactionBoundary/ConnectionBoundary";

interface AddToWalletButtonProps {
  token: Address;
  symbol: string;
  decimals: number;
}

const AddToWalletButton: FC<AddToWalletButtonProps> = ({
  token,
  symbol,
  decimals,
}) => {
  const { network } = useExpectedNetwork();
  const watchAsset = useWatchAsset(token, symbol, decimals);
  const { expectedNetwork, isCorrectNetwork } = useConnectionBoundary();
  const { address: accountAddress } = useAccount();
  const dispatch = useDispatch();

  const addToWallet = useCallback(() => {
    watchAsset()
      .then(() => {
        if (accountAddress) {
          dispatch(
            addAccountChainTokenFlag({
              type: Flag.TokenAdded,
              account: accountAddress,
              chainId: network.id,
              token,
            })
          );
        }
      })
      .catch(() => {
        console.warn("Failed to add token to wallet.");
      });
  }, [accountAddress, token, network, watchAsset, dispatch]);

  const { switchNetwork } = useSwitchNetwork({
    onSuccess: addToWallet,
  });

  const addToWalletWithNetworkCheck = () => {
    if (isCorrectNetwork) {
      addToWallet();
    } else {
      switchNetwork && switchNetwork(expectedNetwork.id);
    }
  };

  return (
    <LoadingButton
      color="primary"
      variant="textContained"
      startIcon={<AccountBalanceWalletOutlinedIcon />}
      onClick={addToWalletWithNetworkCheck}
    >
      Add To Wallet
    </LoadingButton>
  );
};

export default AddToWalletButton;
