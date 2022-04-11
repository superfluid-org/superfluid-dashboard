import { FC, useEffect, useState } from "react";
import { SuperTokenUpgradeRecovery } from "../../redux/transactionRecoveries";
import { useNetworkContext } from "../../contexts/NetworkContext";
import { useWalletContext } from "../../contexts/WalletContext";
import { TokenUpgradeDowngradePair } from "../../redux/endpoints/adHocSubgraphEndpoints";
import { BigNumber, ethers } from "ethers";
import { rpcApi } from "../../redux/store";
import { skipToken } from "@reduxjs/toolkit/query";
import {
  Button,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { TokenDialogChip } from "./TokenDialogChip";
import TokenIcon from "../TokenIcon";
import { TransactionButton } from "./TransactionButton";
import { useTransactionContext } from "../TransactionDrawer/TransactionContext";

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
      ) : balanceOfQuery.isUninitialized || balanceOfQuery.isFetching ? "" : (
        ethers.utils.formatEther(balanceOfQuery?.data ?? 0).toString()
      )}
    </Typography>
  );
};

export const UpgradePanel: FC<{
  transactionRecovery: SuperTokenUpgradeRecovery | undefined;
}> = ({ transactionRecovery }) => {
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();
  const { setTransactionDrawerOpen } = useTransactionContext();

  const [selectedToken, setSelectedToken] = useState<
    TokenUpgradeDowngradePair | undefined
  >();

  const [amount, setAmount] = useState<number>(0);
  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(amount)
  );

  useEffect(
    () => setAmountWei(ethers.BigNumber.from(amount.toString())),
    [amount]
  );

  useEffect(() => {
    if (transactionRecovery) {
      setSelectedToken(transactionRecovery.tokenUpgrade);
      setAmount(
        Number(ethers.utils.formatUnits(transactionRecovery.amountWei, "ether"))
      );
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
    ? currentAllowance.gt(amount)
      ? ethers.BigNumber.from(0)
      : amountWei.sub(currentAllowance)
    : null;

  const [approveTrigger, approveResult] = rpcApi.useApproveMutation();
  const [upgradeTrigger, upgradeResult] = rpcApi.useSuperTokenUpgradeMutation();


  const isApproveAllowanceVisible =
    !!(selectedToken &&
    currentAllowance &&
    missingAllowance &&
    missingAllowance.gt(0));

  const isUpgradeDisabled = !selectedToken || !!isApproveAllowanceVisible;

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
            value={amount}
            onChange={(e) => setAmount(Number(e.currentTarget.value))}
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
          <TextField disabled value={amount} sx={{ width: "50%" }} />
        </Stack>
        {selectedToken && walletAddress && (
          <Stack direction="row-reverse">
            <Balance
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedToken.superToken.address}
            ></Balance>
          </Stack>
        )}
      </Stack>

      {currentAllowance && (
        <Typography>
          Current allowance: {currentAllowance.toString()}
        </Typography>
      )}

      {missingAllowance && (
        <Typography>
          Missing allowance: {missingAllowance.toString()}
        </Typography>
      )}

      {isApproveAllowanceVisible && (
        <TransactionButton
          text="Approve Allowance"
          mutationResult={approveResult}
          onClick={async () => {
            await approveTrigger({
              chainId: network.chainId,
              amountWei: currentAllowance.add(missingAllowance).toString(),
              superTokenAddress: selectedToken.superToken.address,
            });

            setTransactionDrawerOpen(true);
          }}
          disabled={false}
        />
      )}

      <TransactionButton
        text="Upgrade to super token"
        disabled={isUpgradeDisabled}
        mutationResult={upgradeResult}
        onClick={async () => {
          if (isUpgradeDisabled) {
            throw Error(
              "This should never happen because the token and amount must be selected for the btton to be active."
            );
          }

          const transactionRecovery: SuperTokenUpgradeRecovery = {
            chainId: network.chainId,
            tokenUpgrade: selectedToken,
            amountWei: amountWei.toString(),
          };

          await upgradeTrigger({
            chainId: network.chainId,
            amountWei: amount.toString(),
            superTokenAddress: selectedToken.superToken.address,
            waitForConfirmation: true,
            transactionExtraData: {
              recovery: transactionRecovery,
            },
          });

          setTransactionDrawerOpen(true);
          setSelectedToken(undefined);
          setAmount(0)
        }}
      />
    </Stack>
  );
};
