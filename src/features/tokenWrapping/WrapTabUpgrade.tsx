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

  const [selectedToken, setSelectedToken] = useState<
    TokenUpgradeDowngradePair | undefined
  >();

  const [amount, setAmount] = useState<string>("");
  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(0)
  );

  useEffect(() => {
    setAmountWei(ethers.utils.parseEther(Number(amount) ? amount : "0"));
  }, [amount]);

  useEffect(() => {
    if (restoration) {
      setSelectedToken(restoration.tokenUpgrade);
      setAmount(ethers.utils.formatEther(restoration.amountWei));
    }
  }, [restoration]);

  const onTokenChange = (token: TokenUpgradeDowngradePair | undefined) => {
    setSelectedToken(token);
  };

  const allowanceQuery = rpcApi.useSuperTokenUpgradeAllowanceQuery(
    selectedToken && walletAddress
      ? {
          chainId: network.chainId,
          accountAddress: walletAddress,
          superTokenAddress: selectedToken.superToken.address,
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
    selectedToken &&
    !amountWei.isZero() &&
    currentAllowance &&
    missingAllowance &&
    missingAllowance.gt(0)
  );

  const isUpgradeDisabled =
    !selectedToken || amountWei.isZero() || !!isApproveAllowanceVisible;

  const amountInputRef = useRef<HTMLInputElement>(undefined!);
  useEffect(() => {
    amountInputRef.current.focus();
  }, [amountInputRef, selectedToken]);

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="column" spacing={1}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <TokenDialogChip
            prioritizeSuperTokens={false}
            selectedTokenPair={selectedToken}
            onSelect={onTokenChange}
          />
          <TextField
            disabled={!selectedToken}
            placeholder="0.0"
            inputRef={amountInputRef}
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            sx={{ border: 0, width: "50%" }}
          />
        </Stack>
        {selectedToken && walletAddress && (
          <Stack direction="row-reverse">
            <BalanceUnderlyingToken
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedToken.underlyingToken.address}
            ></BalanceUnderlyingToken>
          </Stack>
        )}
      </Stack>

      <Stack sx={{ ...(!selectedToken ? { display: "none" } : {}) }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Chip
            icon={
              selectedToken ? (
                <TokenIcon tokenSymbol={selectedToken.underlyingToken.symbol} />
              ) : (
                <></>
              )
            }
            label={
              <>
                <Stack direction="row" alignItems="center">
                  {selectedToken?.superToken.symbol ?? ""}
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
        {selectedToken && walletAddress && (
          <Stack direction="row-reverse">
            <BalanceSuperToken
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedToken.superToken.address}
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
        text="Approve Allowance"
        mutationResult={approveResult}
        hidden={!isApproveAllowanceVisible}
        disabled={false}
        onClick={() => {
          if (!isApproveAllowanceVisible) {
            throw Error("This should never happen.");
          }

          const infoText = `You are approving extra allowance of ${ethers.utils.formatEther(
            amountWei
          )} ${
            selectedToken?.underlyingToken.symbol
          } for Superfluid Protocol to use.`;

          return {
            infoText,
            trigger: () =>
              approveTrigger({
                chainId: network.chainId,
                amountWei: currentAllowance.add(missingAllowance).toString(),
                superTokenAddress: selectedToken.superToken.address,
              }).unwrap(),
          };
        }}
      />

      <TransactionButton
        text="Upgrade to Super Token"
        hidden={false}
        disabled={isUpgradeDisabled}
        mutationResult={upgradeResult}
        onClick={() => {
          if (isUpgradeDisabled) {
            throw Error(
              "This should never happen because the token and amount must be selected for the button to be active."
            );
          }

          const infoText = `Upgrade from ${ethers.utils.formatEther(
            amountWei
          )} ${selectedToken.underlyingToken.symbol} to the super token ${
            selectedToken.superToken.symbol
          }.`;

          return {
            infoText,
            trigger: () =>
              upgradeTrigger({
                chainId: network.chainId,
                amountWei: amountWei.toString(),
                superTokenAddress: selectedToken.superToken.address,
                waitForConfirmation: true,
                transactionExtraData: {
                  restoration: {
                    chainId: network.chainId,
                    tokenUpgrade: selectedToken,
                    amountWei: amountWei.toString(),
                  } as SuperTokenUpgradeRestoration,
                  infoText: infoText,
                },
              }).unwrap(),
            clean: () => setAmount(""),
          };
        }}
      />
    </Stack>
  );
};
