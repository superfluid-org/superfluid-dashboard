import { FC, useEffect, useRef, useState } from "react";
import { SuperTokenUpgradeRecovery } from "../../redux/transactionRecoveries";
import { useNetworkContext } from "../Network/NetworkContext";
import { useWalletContext } from "../Wallet/WalletContext";
import { TokenUpgradeDowngradePair } from "../../redux/endpoints/adHocSubgraphEndpoints";
import { BigNumber, ethers } from "ethers";
import { rpcApi, subgraphApi } from "../../redux/store";
import { skipToken } from "@reduxjs/toolkit/query";
import { Chip, Stack, TextField, Typography } from "@mui/material";
import { TokenDialogChip } from "./TokenDialogChip";
import TokenIcon from "../Token/TokenIcon";
import { TransactionButton } from "../Transactions/TransactionButton";
import FlowingBalance from "../Token/FlowingBalance";
import EtherFormatted from "../Token/EtherFormatted";

export const Balance: FC<{
  chainId: number;
  accountAddress: string;
  tokenAddress: string;
}> = ({ chainId, accountAddress, tokenAddress }) => {
  const balanceOfQuery = rpcApi.useBalanceOfQuery({
    chainId,
    accountAddress,
    tokenAddress,
  });

  return (
    <Typography variant="body2">
      Balance:{" "}
      {balanceOfQuery.error ? (
        "error"
      ) : balanceOfQuery.isUninitialized || balanceOfQuery.isLoading ? (
        ""
      ) : (
        <EtherFormatted
          wei={ethers.BigNumber.from(balanceOfQuery?.data ?? 0).toString()}
        />
      )}
    </Typography>
  );
};

export const SuperTokenBalance: FC<{
  chainId: number;
  accountAddress: string;
  tokenAddress: string;
}> = ({ chainId, accountAddress, tokenAddress }) => {
  const accountTokenSnapshotQuery = subgraphApi.useAccountTokenSnapshotQuery({
    chainId,
    id: `${accountAddress}-${tokenAddress}`.toLowerCase(),
  });

  return (
    <Typography variant="body2">
      Balance:{" "}
      {accountTokenSnapshotQuery.error ? (
        "error"
      ) : accountTokenSnapshotQuery.isUninitialized ||
        accountTokenSnapshotQuery.isLoading ? (
        ""
      ) : !accountTokenSnapshotQuery.data ? (
        ethers.utils.formatEther(0)
      ) : (
        <FlowingBalance
          balance={accountTokenSnapshotQuery.data.balanceUntilUpdatedAt}
          balanceTimestamp={accountTokenSnapshotQuery.data.updatedAtTimestamp}
          flowRate={accountTokenSnapshotQuery.data.totalNetFlowRate}
        />
      )}
    </Typography>
  );
};

export const UpgradePanel: FC<{
  transactionRecovery: SuperTokenUpgradeRecovery | undefined;
}> = ({ transactionRecovery }) => {
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
    if (transactionRecovery) {
      setSelectedToken(transactionRecovery.tokenUpgrade);
      setAmount(ethers.utils.formatEther(transactionRecovery.amountWei));
    }
  }, [transactionRecovery]);

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
            _selectedToken={selectedToken}
            onChange={onTokenChange}
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
            <Balance
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedToken.underlyingToken.address}
            ></Balance>
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
            <SuperTokenBalance
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedToken.superToken.address}
            ></SuperTokenBalance>
          </Stack>
        )}
      </Stack>

      {missingAllowance?.gt(0) && (
        <Typography>
          Missing allowance:{" "}
          {ethers.utils.formatEther(missingAllowance.toString())}
        </Typography>
      )}

      {isApproveAllowanceVisible && (
        <TransactionButton
          text="Approve Allowance"
          mutationResult={approveResult}
          disabled={false}
          onClick={() => {
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
      )}

      <TransactionButton
        text="Upgrade to Super Token"
        disabled={isUpgradeDisabled}
        mutationResult={upgradeResult}
        onClick={() => {
          if (isUpgradeDisabled) {
            throw Error(
              "This should never happen because the token and amount must be selected for the btton to be active."
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
                  recovery: {
                    chainId: network.chainId,
                    tokenUpgrade: selectedToken,
                    amountWei: amountWei.toString(),
                  } as SuperTokenUpgradeRecovery,
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
