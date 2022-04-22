import { FC, useEffect, useRef, useState } from "react";
import { SuperTokenUpgradeRestoration } from "../transactionRestoration/transactionRestorations";
import { useNetworkContext } from "../network/NetworkContext";
import { useWalletContext } from "../wallet/WalletContext";
import { TokenUpgradeDowngradePair } from "../redux/endpoints/adHocSubgraphEndpoints";
import { BigNumber, ethers } from "ethers";
import { rpcApi } from "../redux/store";
import { skipToken } from "@reduxjs/toolkit/query";
import { Chip, Stack, TextField, Typography } from "@mui/material";
import { TokenDialogChip } from "./TokenDialogChip";
import TokenIcon from "../token/TokenIcon";
import { TransactionButton } from "../transactions/TransactionButton";
import { BalanceUnderlyingToken } from "./BalanceUnderlyingToken";
import { BalanceSuperToken } from "./BalanceSuperToken";

export const WrapTabUpgrade: FC<{
  restoration: SuperTokenUpgradeRestoration | undefined;
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

  const allowanceQuery = rpcApi.useSuperTokenUpgradeAllowanceQuery(
    selectedTokenPair && walletAddress
      ? {
          chainId: network.chainId,
          accountAddress: walletAddress,
          superTokenAddress: selectedTokenPair.superToken.address,
        }
      : skipToken
  );

  const currentAllowance = allowanceQuery.data
    ? ethers.BigNumber.from(allowanceQuery.data)
    : null;

  const missingAllowance = currentAllowance
    ? currentAllowance.gt(amountWei)
      ? ethers.BigNumber.from(0)
      : amountWei.sub(currentAllowance)
    : null;

  const [approveTrigger, approveResult] = rpcApi.useApproveMutation();
  const [upgradeTrigger, upgradeResult] = rpcApi.useSuperTokenUpgradeMutation();

  const isApproveAllowanceVisible = !!(
    selectedTokenPair &&
    !amountWei.isZero() &&
    currentAllowance &&
    missingAllowance &&
    missingAllowance.gt(0)
  );

  const isUpgradeDisabled =
    !selectedTokenPair || amountWei.isZero() || !!isApproveAllowanceVisible;

  const amountInputRef = useRef<HTMLInputElement>(undefined!);
  useEffect(() => {
    amountInputRef.current.focus();
  }, [amountInputRef, selectedTokenPair]);

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <TokenDialogChip
            prioritizeSuperTokens={false}
            selectedTokenPair={selectedTokenPair}
            onSelect={onTokenChange}
          />
          <TextField
            disabled={!selectedTokenPair}
            placeholder="0.0"
            inputRef={amountInputRef}
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            sx={{ border: 0, width: "50%" }}
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

      <Stack sx={{ ...(!selectedTokenPair ? { display: "none" } : {}) }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Chip
            icon={
              selectedTokenPair ? (
                <TokenIcon tokenSymbol={selectedTokenPair.superToken.symbol} />
              ) : (
                <></>
              )
            }
            label={
              <>
                <Stack direction="row" alignItems="center">
                  {selectedTokenPair?.superToken.symbol ?? ""}
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
            <BalanceSuperToken
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedTokenPair.superToken.address}
            ></BalanceSuperToken>
          </Stack>
        )}
      </Stack>

      {missingAllowance?.gt(0) && (
        <Typography>
          Missing allowance:{" "}
          {ethers.utils.formatEther(missingAllowance.toString())}
        </Typography>
      )}

      <TransactionButton
        mutationResult={approveResult}
        hidden={!isApproveAllowanceVisible}
        disabled={false}
        onClick={(setTransactionDialogContent) => {
          if (!isApproveAllowanceVisible) {
            throw Error("This should never happen.");
          }

          setTransactionDialogContent(
            <AllowancePreview
              amountWei={currentAllowance.add(missingAllowance).toString()}
              symbol={selectedTokenPair.underlyingToken.symbol}
            />
          );

          approveTrigger({
            chainId: network.chainId,
            amountWei: currentAllowance.add(missingAllowance).toString(),
            superTokenAddress: selectedTokenPair.superToken.address,
          });
        }}
      >
        Approve Allowance
      </TransactionButton>

      <TransactionButton
        hidden={false}
        disabled={isUpgradeDisabled}
        mutationResult={upgradeResult}
        onClick={(setTransactionDialogContent) => {
          if (isUpgradeDisabled) {
            throw Error(
              "This should never happen because the token and amount must be selected for the button to be active."
            );
          }

          const restoration: SuperTokenUpgradeRestoration = {
            chainId: network.chainId,
            tokenUpgrade: selectedTokenPair,
            amountWei: amountWei.toString(),
          };

          upgradeTrigger({
            chainId: network.chainId,
            amountWei: amountWei.toString(),
            superTokenAddress: selectedTokenPair.superToken.address,
            waitForConfirmation: true,
            transactionExtraData: {
              restoration,
            },
          });

          setAmount("");
          setTransactionDialogContent(
            <UpgradePreview restoration={restoration} />
          );
        }}
      >
        Upgrade to Super Token
      </TransactionButton>
    </Stack>
  );
};

const UpgradePreview: FC<{
  restoration: SuperTokenUpgradeRestoration;
}> = ({ restoration: { amountWei, tokenUpgrade } }) => {
  return (
    <Typography variant="body2" sx={{ my: 2 }}>
      You are upgrading from ${ethers.utils.formatEther(amountWei)}{" "}
      {tokenUpgrade.underlyingToken.symbol} to the super token{" "}
      {tokenUpgrade.superToken.symbol}.
    </Typography>
  );
};

const AllowancePreview: FC<{
  amountWei: string;
  symbol: string;
}> = ({ amountWei, symbol }) => {
  return (
    <Typography variant="body2" sx={{ my: 2 }}>
      You are approving extra allowance of {ethers.utils.formatEther(amountWei)}{" "}
      {symbol} for Superfluid Protocol to use.
    </Typography>
  );
};
