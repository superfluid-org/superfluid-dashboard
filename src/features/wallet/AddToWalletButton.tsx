import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { IconButton, Tooltip } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useSwitchChain, useWatchAsset } from "wagmi";
import { useAccount } from "@/hooks/useAccount"
import { addTokenAddedFlag } from "../flags/flags.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useConnectionBoundary } from "../transactionBoundary/ConnectionBoundary";
import { useTokenQuery } from "../../hooks/useTokenQuery";

interface AddToWalletButtonProps {
  token: Address;
  symbol: string;
  decimals: number;
}

const AddToWalletButton: FC<AddToWalletButtonProps> = ({
  token: tokenAddress,
  symbol,
  decimals,
}) => {
  const { network } = useExpectedNetwork();
  const { expectedNetwork, isCorrectNetwork } = useConnectionBoundary();
  const { address: accountAddress, connector } = useAccount();
  const dispatch = useDispatch();
  const { data: token } = useTokenQuery({ chainId: network.id, id: tokenAddress });
  const { watchAssetAsync } = useWatchAsset();

  const addToWallet = useCallback(async () => {
    if (connector && connector.watchAsset && accountAddress) {
      const tokenImage = token?.logoURI;

      watchAssetAsync({
        type: "ERC20",
        options: {
          address: tokenAddress,
          symbol,
          decimals,
          image: tokenImage,
        }
      })
        .then(() =>
          dispatch(
            addTokenAddedFlag({
              account: accountAddress,
              chainId: network.id,
              token: tokenAddress,
              walletId: connector.id,
            })
          )
        )
        .catch(() => {
          console.warn("Failed to add token to wallet.");
        });
    }
  }, [
    accountAddress,
    tokenAddress,
    symbol,
    decimals,
    network,
    connector,
    dispatch,
    token
  ]);

  const { switchChain } = useSwitchChain({
    mutation: {
      onSuccess: addToWallet,
    }
  });

  const addToWalletWithNetworkCheck = () => {
    if (isCorrectNetwork) {
      addToWallet();
    } else {
      switchChain && switchChain({ chainId: expectedNetwork.id });
    }
  };

  return (
    <Tooltip title="Add to Wallet">
      <IconButton data-cy={"add-to-wallet-button"} color="primary" onClick={addToWalletWithNetworkCheck}>
        <AccountBalanceWalletOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
};

export default AddToWalletButton;
