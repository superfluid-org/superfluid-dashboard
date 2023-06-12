import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import { IconButton, Tooltip } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useAccount, useSwitchNetwork } from "wagmi";
import config from "../../utils/config";
import { addTokenAddedFlag } from "../flags/flags.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { assetApiSlice } from "../token/tokenManifestSlice";
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
  const { expectedNetwork, isCorrectNetwork } = useConnectionBoundary();
  const { address: accountAddress, connector } = useAccount();
  const dispatch = useDispatch();
  const [tokenManifestTrigger] = assetApiSlice.useLazyTokenManifestQuery();

  const addToWallet = useCallback(async () => {
    if (connector && connector.watchAsset && accountAddress) {
      const tokenImage = await tokenManifestTrigger({
        tokenSymbol: symbol,
      })
        .then((response) =>
          response.data?.svgIconPath
            ? `${config.tokenIconUrl}${response.data?.svgIconPath}`
            : undefined
        )
        .catch(() => undefined);

      connector
        .watchAsset({
          address: token,
          symbol,
          decimals,
          image: tokenImage,
        })
        .then(() =>
          dispatch(
            addTokenAddedFlag({
              account: accountAddress,
              chainId: network.id,
              token,
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
    token,
    symbol,
    decimals,
    network,
    connector,
    dispatch,
    tokenManifestTrigger,
  ]);

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
    <Tooltip title="Add to Wallet">
      <IconButton data-cy={"add-to-wallet-button"} color="primary" onClick={addToWalletWithNetworkCheck}>
        <AccountBalanceWalletOutlinedIcon />
      </IconButton>
    </Tooltip>
  );
};

export default AddToWalletButton;
