import React, { FC, useEffect, useRef, useState } from "react";
import { SuperTokenDowngradeRestoration } from "../transactionRestoration/transactionRestorations";
import { useNetworkContext } from "../network/NetworkContext";
import { useWalletContext } from "../wallet/WalletContext";
import { TokenUpgradeDowngradePair } from "../redux/endpoints/adHocSubgraphEndpoints";
import { BigNumber, ethers } from "ethers";
import { rpcApi } from "../redux/store";
import { Chip, Stack, TextField, Typography } from "@mui/material";
import { TokenDialogChip } from "./TokenDialogChip";
import TokenIcon from "../token/TokenIcon";
import { TransactionButton } from "../transactions/TransactionButton";
import { BalanceUnderlyingToken } from "./BalanceUnderlyingToken";
import { BalanceSuperToken } from "./BalanceSuperToken";

export const WrapTabDowngrade: FC<{
  restoration: SuperTokenDowngradeRestoration | undefined;
}> = ({ restoration }) => {
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();

  const [selectedTokenPair, setSelectedTokenPair] = useState<
    TokenUpgradeDowngradePair | undefined
  >(network.defaultTokenPair);

  useEffect(() => {
    if (!selectedTokenPair) {
      setSelectedTokenPair(network.defaultTokenPair);
    }
  }, [selectedTokenPair]);

  const [amount, setAmount] = useState<string>("");
  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(0)
  );

  useEffect(() => {
    setAmountWei(ethers.utils.parseEther(Number(amount) ? amount : "0"));
  }, [amount]);

  useEffect(() => {
    if (restoration) {
      setSelectedTokenPair(restoration.tokenUpgrade);
      setAmount(ethers.utils.formatEther(restoration.amountWei));
    }
  }, [restoration]);

  const onTokenChange = (token: TokenUpgradeDowngradePair | undefined) => {
    setSelectedTokenPair(token);
  };

  const [downgradeTrigger, downgradeResult] =
    rpcApi.useSuperTokenDowngradeMutation();
  const isDowngradeDisabled = !selectedTokenPair || amountWei.isZero();
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactionDialogContent, setTransactionDialogContent] =
    useState<React.ReactNode>("");

  const amountInputRef = useRef<HTMLInputElement>(undefined!);
  useEffect(() => {
    amountInputRef.current.focus();
  }, [amountInputRef, selectedTokenPair]);

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <TokenDialogChip
            prioritizeSuperTokens={true}
            selectedTokenPair={selectedTokenPair}
            onSelect={onTokenChange}
          />
          <TextField
            placeholder="0.0"
            inputRef={amountInputRef}
            disabled={!selectedTokenPair}
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            sx={{ border: 0, width: "50%" }}
          />
        </Stack>
        {selectedTokenPair && walletAddress && (
          <Stack direction="row-reverse">
            <BalanceSuperToken
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedTokenPair.superToken.address}
            ></BalanceSuperToken>
          </Stack>
        )}
      </Stack>
      <Stack sx={{ display: selectedTokenPair ? "" : "none" }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Chip
            icon={
              selectedTokenPair ? (
                <TokenIcon
                  tokenSymbol={selectedTokenPair.underlyingToken.symbol}
                />
              ) : (
                <></>
              )
            }
            label={
              <>
                <Stack direction="row" alignItems="center">
                  {selectedTokenPair?.underlyingToken.symbol ?? ""}
                </Stack>
              </>
            }
          ></Chip>
          <TextField
            disabled
            placeholder="0.0"
            value={amount}
            sx={{ width: "50%" }}
          />
        </Stack>
        {selectedTokenPair && walletAddress && (
          <Stack direction="row-reverse">
            <BalanceUnderlyingToken
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedTokenPair.underlyingToken.address}
            ></BalanceUnderlyingToken>
          </Stack>
        )}
      </Stack>

      <TransactionButton
        hidden={false}
        mutationResult={downgradeResult}
        disabled={isDowngradeDisabled}
        onClick={(setTransactionDialogContent) => {
          if (isDowngradeDisabled) {
            throw Error(
              "This should never happen because the token and amount must be selected for the button to be active."
            );
          }

          const restoration: SuperTokenDowngradeRestoration = {
            chainId: network.chainId,
            tokenUpgrade: selectedTokenPair,
            amountWei: amountWei.toString(),
          };

          downgradeTrigger({
            chainId: network.chainId,
            amountWei: amountWei.toString(),
            superTokenAddress: selectedTokenPair.superToken.address,
            waitForConfirmation: true,
            transactionExtraData: {
              restoration,
            },
          });

          setTransactionDialogContent(
            <DowngradePreview restoration={restoration} />
          );

          setAmount("");
        }}
      >
        Downgrade
      </TransactionButton>
    </Stack>
  );
};

const DowngradePreview: FC<{
  restoration: SuperTokenDowngradeRestoration;
}> = ({ restoration: { amountWei, tokenUpgrade } }) => {
  return (
    <Typography variant="body2" sx={{ my: 2 }}>
      You are downgrading from ${ethers.utils.formatEther(amountWei)}{" "}
      {tokenUpgrade.superToken.symbol} to the underlying token{" "}
      {tokenUpgrade.underlyingToken.symbol}.
    </Typography>
  );
};
