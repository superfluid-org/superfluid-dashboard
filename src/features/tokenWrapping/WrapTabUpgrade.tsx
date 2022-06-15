import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  ApproveAllowanceRestoration,
  SuperTokenUpgradeRestoration,
  RestorationType,
} from "../transactionRestoration/transactionRestorations";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { BigNumber, ethers } from "ethers";
import { rpcApi, subgraphApi } from "../redux/store";
import {
  Alert,
  Avatar,
  Button,
  Input,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { FC, useEffect, useRef, useState } from "react";
import TokenIcon from "../token/TokenIcon";
import { TransactionButton } from "../transactions/TransactionButton";
import { BalanceSuperToken } from "./BalanceSuperToken";
import { BalanceUnderlyingToken } from "./BalanceUnderlyingToken";
import { TokenDialogButton } from "./TokenDialogButton";
import { NATIVE_ASSET_ADDRESS } from "../redux/endpoints/tokenTypes";
import { useRouter } from "next/router";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactions/TransactionDialog";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { WrappingForm, ValidWrappingForm } from "./WrappingFormProvider";
import { Controller, useFormContext } from "react-hook-form";
import { parseEther } from "ethers/lib/utils";
import { ErrorMessage } from "@hookform/error-message";

export const WrapTabUpgrade: FC = () => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const router = useRouter();
  const { visibleAddress } = useVisibleAddress();
  const { setTransactionDrawerOpen } = useTransactionDrawerContext();

  const {
    watch,
    control,
    reset: resetForm,
    formState,
    getValues,
    setValue
  } = useFormContext<WrappingForm>();

  // The reason to set the type and clear errors is that a single form context is used both for wrapping and unwrapping.
  useEffect(() => {
    setValue("type", RestorationType.Upgrade, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, []);

  const [selectedTokenPair, amount] = watch([
    "data.tokenUpgrade",
    "data.amountEther",
  ]);

  const [amountWei, setAmountWei] = useState<BigNumber>(
    ethers.BigNumber.from(0)
  );

  useEffect(() => {
    setAmountWei(ethers.utils.parseEther(Number(amount) ? amount : "0"));
  }, [amount]);

  const isUnderlyingBlockchainNativeAsset =
    selectedTokenPair?.underlyingToken.address === NATIVE_ASSET_ADDRESS;

  const { data: _discard, ...allowanceQuery } = rpcApi.useSuperTokenUpgradeAllowanceQuery(
    selectedTokenPair && !isUnderlyingBlockchainNativeAsset && visibleAddress
      ? {
          chainId: network.id,
          accountAddress: visibleAddress,
          superTokenAddress: selectedTokenPair.superToken.address,
        }
      : skipToken
  );

  const currentAllowance = allowanceQuery.currentData
    ? ethers.BigNumber.from(allowanceQuery.currentData)
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
    formState.isValidating || !formState.isValid || !!isApproveAllowanceVisible;

  const amountInputRef = useRef<HTMLInputElement>(undefined!);

  useEffect(() => {
    amountInputRef.current.focus();
  }, [amountInputRef, selectedTokenPair]);

  const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
    chainId: network.id,
  });

  return (
    <Stack direction="column" alignItems="center">
      <Stack
        variant="outlined"
        component={Paper}
        spacing={1}
        sx={{ px: 2.5, py: 1.5 }}
      >
        <Stack direction="row" spacing={2}>
          <Controller
            control={control}
            name="data.amountEther"
            render={({ field: { onChange, onBlur } }) => (
              <Input
                data-cy={"wrap-input"}
                fullWidth
                disableUnderline
                disabled={!selectedTokenPair}
                placeholder="0.0"
                inputRef={amountInputRef}
                value={amount}
                type="number"
                onChange={onChange}
                onBlur={onBlur}
                inputProps={{
                  sx: {
                    ...theme.typography.largeInput,
                    p: 0,
                  },
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="data.tokenUpgrade"
            render={({ field: { onChange, onBlur } }) => (
              <TokenDialogButton
                token={selectedTokenPair?.underlyingToken}
                tokenSelection={{
                  tokenPairsQuery: {
                    data: tokenPairsQuery.data?.map((x) => x.underlyingToken),
                    isUninitialized: tokenPairsQuery.isUninitialized,
                    isLoading: tokenPairsQuery.isLoading,
                  },
                }}
                onTokenSelect={(token) =>
                  onChange(
                    tokenPairsQuery?.data?.find(
                      (x) => x.underlyingToken.address === token.address
                    )
                  )
                }
                onBlur={onBlur}
              />
            )}
          />
        </Stack>
        {selectedTokenPair && visibleAddress && (
          <Stack direction="row" justifyContent="flex-end">
            {/* <Typography variant="body2" color="text.secondary">
            ${Number(amount || 0).toFixed(2)}
          </Typography> */}
            <BalanceUnderlyingToken
              chainId={network.id}
              accountAddress={visibleAddress}
              tokenAddress={selectedTokenPair.underlyingToken.address}
            />
          </Stack>
        )}
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
              data-cy={"wrapable-amount"}
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

          {selectedTokenPair && visibleAddress && (
            <Stack direction="row" justifyContent="flex-end">
              {/* <Typography variant="body2" color="text.secondary">
              ${Number(amount || 0).toFixed(2)}
            </Typography> */}
              <BalanceSuperToken
                chainId={network.id}
                accountAddress={visibleAddress}
                tokenAddress={selectedTokenPair.superToken.address}
                typographyProps={{ color: "text.secondary" }}
              />
            </Stack>
          )}
        </Stack>
      )}

      {selectedTokenPair && (
        <Typography data-cy="token-pair" align="center" sx={{ my: 3 }}>
          {`1 ${selectedTokenPair.underlyingToken.symbol} = 1 ${selectedTokenPair.superToken.symbol}`}
        </Typography>
      )}

      <Stack gap={2} direction="column" sx={{ width: "100%" }}>
        <TransactionButton
          dataCy={"approve-allowance-button"}
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
              chainId: network.id,
              amountWei: approveAllowanceAmountWei.toString(),
              token: selectedTokenPair.underlyingToken,
            };

            setTransactionDialogContent({
              label: <AllowancePreview restoration={restoration} />,
            });

            approveTrigger({
              chainId: network.id,
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
          dataCy={"upgrade-button"}
          hidden={false}
          disabled={isUpgradeDisabled}
          mutationResult={upgradeResult}
          onClick={(setTransactionDialogContent, closeTransactionDialog) => {
            if (!formState.isValid) {
              throw Error(
                `This should never happen. Form state: ${JSON.stringify(
                  formState,
                  null,
                  2
                )}`
              );
            }

            const { data: formData } = getValues() as ValidWrappingForm;

            const restoration: SuperTokenUpgradeRestoration = {
              type: RestorationType.Upgrade,
              chainId: network.id,
              tokenUpgrade: selectedTokenPair,
              amountWei: parseEther(formData.amountEther).toString(),
            };

            upgradeTrigger({
              chainId: network.id,
              amountWei: parseEther(formData.amountEther).toString(),
              superTokenAddress: formData.tokenUpgrade.superToken.address,
              waitForConfirmation: true,
              transactionExtraData: {
                restoration,
              },
            })
              .unwrap()
              .then(() => resetForm());

            setTransactionDialogContent({
              label: <UpgradePreview restoration={restoration} />,
              successActions: (
                <TransactionDialogActions>
                  <Stack gap={1} sx={{ width: "100%" }}>
                    <TransactionDialogButton
                      color="secondary"
                      onClick={closeTransactionDialog}
                    >
                      Wrap more tokens
                    </TransactionDialogButton>
                    <TransactionDialogButton
                      color="primary"
                      onClick={() =>
                        router
                          .push("/")
                          .then(() => setTransactionDrawerOpen(true))
                      }
                    >
                      Go to tokens page ➜
                    </TransactionDialogButton>
                  </Stack>
                </TransactionDialogActions>
              ),
            });
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
