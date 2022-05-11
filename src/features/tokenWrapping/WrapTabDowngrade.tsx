import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Avatar, Button, Input, Paper, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/system";
import { BigNumber, ethers } from "ethers";
import { FC, useEffect, useRef, useState } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import { rpcApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import {
  RestorationType,
  SuperTokenDowngradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { TransactionButton } from "../transactions/TransactionButton";
import { useWalletContext } from "../wallet/WalletContext";
import { BalanceSuperToken } from "./BalanceSuperToken";
import { BalanceUnderlyingToken } from "./BalanceUnderlyingToken";
import { useSelectedTokenContext } from "./SelectedTokenPairContext";
import { TokenDialogChip } from "./TokenDialogChip";

export const WrapTabDowngrade: FC<{
  restoration: SuperTokenDowngradeRestoration | undefined;
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

  const [downgradeTrigger, downgradeResult] =
    rpcApi.useSuperTokenDowngradeMutation();
  const isDowngradeDisabled = !selectedTokenPair || amountWei.isZero();

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
            type="number"
            placeholder="0.0"
            inputRef={amountInputRef}
            disabled={!selectedTokenPair}
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            inputProps={{
              sx: {
                p: 0,
              },
            }}
          />
          <TokenDialogChip prioritizeSuperTokens={true} />
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
                  p: 0,
                },
              }}
            />
            <Button
              variant="outlined"
              color="secondary"
              startIcon={
                <TokenIcon
                  tokenSymbol={selectedTokenPair.underlyingToken.symbol}
                  size={24}
                />
              }
              endIcon={<ExpandMoreIcon />}
            >
              {selectedTokenPair?.underlyingToken.symbol ?? ""}
            </Button>
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
      )}

      {selectedTokenPair && (
        <Typography align="center" sx={{ my: 3 }}>
          {`1 ${selectedTokenPair.superToken.symbol} = 1 ${selectedTokenPair.underlyingToken.symbol}`}
        </Typography>
      )}

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
            type: RestorationType.Downgrade,
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
          }).then(() => {
            setAmount("");
          });

          setTransactionDialogContent(
            <DowngradePreview restoration={restoration} />
          );
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
    <Typography variant="body2">
      You are downgrading from {ethers.utils.formatEther(amountWei)}{" "}
      {tokenUpgrade.superToken.symbol} to the underlying token{" "}
      {tokenUpgrade.underlyingToken.symbol}.
    </Typography>
  );
};
