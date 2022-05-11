import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Avatar,
  Button,
  Input,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { BigNumber, ethers } from "ethers";
import { FC, useEffect, useRef, useState } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import { COIN_ADDRESS } from "../redux/endpoints/adHocSubgraphEndpoints";
import { rpcApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import {
  ApproveAllowanceRestoration,
  RestorationType,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { TransactionButton } from "../transactions/TransactionButton";
import { useWalletContext } from "../wallet/WalletContext";
import { BalanceSuperToken } from "./BalanceSuperToken";
import { BalanceUnderlyingToken } from "./BalanceUnderlyingToken";
import { useSelectedTokenContext } from "./SelectedTokenPairContext";
import { TokenDialogChip } from "./TokenDialogChip";

export const WrapTabUpgrade: FC<{
  restoration: SuperTokenUpgradeRestoration | undefined;
}> = ({ restoration }) => {
  const theme = useTheme();
  const { network } = useNetworkContext();
  const { walletAddress } = useWalletContext();
  const { selectedTokenPair, setSelectedTokenPair } = useSelectedTokenContext();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restoration]);

  const isUnderlyingBlockchainNativeAsset =
    selectedTokenPair?.underlyingToken.address === COIN_ADDRESS;

  const allowanceQuery = rpcApi.useSuperTokenUpgradeAllowanceQuery(
    selectedTokenPair && !isUnderlyingBlockchainNativeAsset && walletAddress
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
    : ethers.BigNumber.from(0);

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
    <Stack direction="column" alignItems="center">
      <Stack
        variant="outlined"
        component={Paper}
        spacing={1}
        sx={{ px: 2.5, py: 1.5 }}
      >
        <Stack direction="row" spacing={2}>
          <Input
            fullWidth
            disableUnderline
            disabled={!selectedTokenPair}
            placeholder="0.0"
            inputRef={amountInputRef}
            value={amount}
            type="number"
            onChange={(e) => setAmount(e.currentTarget.value)}
            inputProps={{
              sx: {
                ...theme.typography.largeInput,
                p: 0,
              },
            }}
          />
          <TokenDialogChip prioritizeSuperTokens={false} />
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            ${Number(amount || 0).toFixed(2)}
          </Typography>
          {selectedTokenPair && walletAddress && (
            <BalanceUnderlyingToken
              chainId={network.chainId}
              accountAddress={walletAddress}
              tokenAddress={selectedTokenPair.underlyingToken.address}
            />
          )}
        </Stack>
      </Stack>

      <Avatar
        component={Paper}
        elevation={1}
        sx={{
          width: 30,
          height: 30,
          background: theme.palette.background.paper,
          my: -1,
        }}
      >
        <ArrowDownwardIcon color="primary" fontSize="small" />
      </Avatar>

      {selectedTokenPair && (
        <Stack
          component={Paper}
          variant="outlined"
          spacing={1}
          sx={{ px: 2.5, py: 1.5 }}
        >
          <Stack direction="row" spacing={2}>
            <Input
              disabled
              fullWidth
              disableUnderline
              placeholder="0.0"
              value={amount}
              inputProps={{
                sx: {
                  ...theme.typography.largeInput,
                  p: 0,
                },
              }}
            />
            <Button
              variant="outlined"
              color="secondary"
              startIcon={
                <TokenIcon
                  tokenSymbol={selectedTokenPair.superToken.symbol}
                  size={24}
                />
              }
              endIcon={<ExpandMoreIcon />}
            >
              {selectedTokenPair.superToken.symbol ?? ""}
            </Button>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              ${Number(amount || 0).toFixed(2)}
            </Typography>
            {selectedTokenPair && walletAddress && (
              <BalanceSuperToken
                chainId={network.chainId}
                accountAddress={walletAddress}
                tokenAddress={selectedTokenPair.superToken.address}
                typographyProps={{ color: "text.secondary" }}
              />
            )}
          </Stack>
        </Stack>
      )}

      {selectedTokenPair && (
        <Typography align="center" sx={{ my: 3 }}>
          {`1 ${selectedTokenPair.underlyingToken.symbol} = 1 ${selectedTokenPair.superToken.symbol}`}
        </Typography>
      )}

      {missingAllowance?.gt(0) && (
        <Typography>
          {`Missing allowance: ${ethers.utils.formatEther(
            missingAllowance.toString()
          )}`}
        </Typography>
      )}

      <Stack gap={2} direction="column" sx={{ width: "100%" }}>
        <TransactionButton
          mutationResult={approveResult}
          hidden={!isApproveAllowanceVisible}
          disabled={false}
          onClick={(setTransactionDialogContent) => {
            if (!isApproveAllowanceVisible) {
              throw Error("This should never happen.");
            }

            const approveAllowanceAmountWei =
              currentAllowance.add(missingAllowance);

            const restoration: ApproveAllowanceRestoration = {
              type: RestorationType.Approve,
              chainId: network.chainId,
              amountWei: approveAllowanceAmountWei.toString(),
              token: selectedTokenPair.underlyingToken,
            };

            setTransactionDialogContent(
              <AllowancePreview restoration={restoration} />
            );

            approveTrigger({
              chainId: network.chainId,
              amountWei: approveAllowanceAmountWei.toString(),
              superTokenAddress: selectedTokenPair.superToken.address,
              transactionExtraData: {
                restoration,
              },
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
              type: RestorationType.Upgrade,
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
            }).then(() => {
              setAmount("");
            });

            setTransactionDialogContent(
              <UpgradePreview restoration={restoration} />
            );
          }}
        >
          Upgrade to Super Token
        </TransactionButton>
      </Stack>
    </Stack>
  );
};

const UpgradePreview: FC<{
  restoration: SuperTokenUpgradeRestoration;
}> = ({ restoration: { amountWei, tokenUpgrade } }) => {
  return (
    <Typography variant="h5" color="text.secondary">
      You are upgrading from {ethers.utils.formatEther(amountWei)}{" "}
      {tokenUpgrade.underlyingToken.symbol} to the super token{" "}
      {tokenUpgrade.superToken.symbol}.
    </Typography>
  );
};

const AllowancePreview: FC<{
  restoration: ApproveAllowanceRestoration;
}> = ({ restoration: { amountWei, token } }) => {
  return (
    <Typography variant="h5" color="text.secondary">
      You are approving extra allowance of {ethers.utils.formatEther(amountWei)}{" "}
      {token.symbol} for Superfluid Protocol to use.
    </Typography>
  );
};
