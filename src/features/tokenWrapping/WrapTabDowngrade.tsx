import { Button, Input, Stack, Typography, useTheme } from "@mui/material";
import { ethers } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { useRouter } from "next/router";
import { FC, useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi, subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import { useTransactionDrawerContext } from "../transactionDrawer/TransactionDrawerContext";
import {
  RestorationType,
  SuperTokenDowngradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { TransactionButton } from "../transactions/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactions/TransactionDialog";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { BalanceSuperToken } from "./BalanceSuperToken";
import { BalanceUnderlyingToken } from "./BalanceUnderlyingToken";
import { TokenDialogButton } from "./TokenDialogButton";
import { ArrowDownIcon, WrapInputCard } from "./WrapCard";
import { ValidWrappingForm, WrappingForm } from "./WrappingFormProvider";

export const WrapTabDowngrade: FC = () => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const router = useRouter();
  const { visibleAddress } = useVisibleAddress();
  const { setTransactionDrawerOpen } = useTransactionDrawerContext();
  const getTransactionOverrides = useGetTransactionOverrides();

  const {
    watch,
    control,
    formState,
    getValues,
    setValue,
    reset: resetForm,
  } = useFormContext<WrappingForm>();

  // The reason to set the type and clear errors is that a single form context is used both for wrapping and unwrapping.
  useEffect(() => {
    setValue("type", RestorationType.Downgrade, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, []);

  const [selectedTokenPair, amount] = watch([
    "data.tokenUpgrade",
    "data.amountEther",
  ]);

  const [downgradeTrigger, downgradeResult] =
    rpcApi.useSuperTokenDowngradeMutation();
  const isDowngradeDisabled = formState.isValidating || !formState.isValid;

  const amountInputRef = useRef<HTMLInputElement>(undefined!);

  useEffect(() => {
    amountInputRef.current.focus();
  }, [amountInputRef, selectedTokenPair]);

  const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
    chainId: network.id,
  });

  return (
    <Stack direction="column" alignItems="center">
      <WrapInputCard>
        <Stack direction="row" spacing={2}>
          <Controller
            control={control}
            name="data.amountEther"
            render={({ field: { onChange, onBlur } }) => (
              <Input
                data-cy={"unwrap-input"}
                fullWidth
                disableUnderline
                type="number"
                placeholder="0.0"
                inputRef={amountInputRef}
                disabled={!selectedTokenPair}
                value={amount}
                onChange={onChange}
                onBlur={onBlur}
                inputProps={{
                  min: 0,
                  sx: {
                    ...theme.typography.largeInput,
                    p: 0,
                  },
                }}
                sx={{ background: "transparent" }}
              />
            )}
          />

          <Controller
            control={control}
            name="data.tokenUpgrade"
            render={({ field: { onChange, onBlur } }) => (
              <TokenDialogButton
                token={selectedTokenPair?.superToken}
                tokenSelection={{
                  tokenPairsQuery: {
                    data: tokenPairsQuery.data?.map((x) => x.superToken),
                    isUninitialized: tokenPairsQuery.isUninitialized,
                    isLoading: tokenPairsQuery.isLoading,
                  },
                }}
                onTokenSelect={(token) =>
                  onChange(
                    tokenPairsQuery?.data?.find(
                      (x) => x.superToken.address === token.address
                    )
                  )
                }
                onBlur={onBlur}
                ButtonProps={{
                  variant:
                    theme.palette.mode === "light" ? "outlined" : "token",
                }}
              />
            )}
          />
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
              TypographyProps={{ color: "text.secondary" }}
            />
          </Stack>
        )}
      </WrapInputCard>

      <ArrowDownIcon />

      {selectedTokenPair && (
        <WrapInputCard>
          <Stack direction="row" spacing={2}>
            <Input
              data-cy={"unwrap-amount-preview"}
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
              sx={{ background: "transparent" }}
            />

            <Button
              variant={theme.palette.mode === "light" ? "outlined" : "token"}
              color="secondary"
              startIcon={
                <TokenIcon
                  tokenSymbol={selectedTokenPair.underlyingToken.symbol}
                  size={24}
                />
              }
              sx={{ pointerEvents: "none" }}
            >
              {selectedTokenPair?.underlyingToken.symbol ?? ""}
            </Button>
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
        </WrapInputCard>
      )}

      {selectedTokenPair && (
        <Typography data-cy={"token-pair"} align="center" sx={{ my: 3 }}>
          {`1 ${selectedTokenPair.superToken.symbol} = 1 ${selectedTokenPair.underlyingToken.symbol}`}
        </Typography>
      )}

      <TransactionButton
        dataCy={"downgrade-button"}
        hidden={false}
        mutationResult={downgradeResult}
        disabled={isDowngradeDisabled}
        onClick={async (
          signer,
          setTransactionDialogContent,
          closeTransactionDialog
        ) => {
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

          const restoration: SuperTokenDowngradeRestoration = {
            type: RestorationType.Downgrade,
            chainId: network.id,
            tokenUpgrade: formData.tokenUpgrade,
            amountWei: parseEther(formData.amountEther).toString(),
          };

          downgradeTrigger({
            signer,
            chainId: network.id,
            amountWei: parseEther(formData.amountEther).toString(),
            superTokenAddress: formData.tokenUpgrade.superToken.address,
            waitForConfirmation: true,
            transactionExtraData: {
              restoration,
            },
            overrides: await getTransactionOverrides(network)
          })
            .unwrap()
            .then(() => resetForm());

          setTransactionDialogContent({
            label: <DowngradePreview restoration={restoration} />,
            successActions: (
              <TransactionDialogActions>
                <TransactionDialogButton
                  color="secondary"
                  onClick={closeTransactionDialog}
                >
                  Unwrap more tokens
                </TransactionDialogButton>
                <TransactionDialogButton
                  color="primary"
                  onClick={() =>
                    router.push("/").then(() => setTransactionDrawerOpen(true))
                  }
                >
                  Go to tokens page ➜
                </TransactionDialogButton>
              </TransactionDialogActions>
            ),
          });
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
