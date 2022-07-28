import { Button, Input, Stack, Typography, useTheme } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { formatEther, parseEther, parseUnits } from "ethers/lib/utils";
import { useRouter } from "next/router";
import { FC, useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { calculateCurrentBalance } from "../../utils/tokenUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi, subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import { useLayoutContext } from "../layout/LayoutContext";
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
import { useAccount } from "wagmi";
import { NATIVE_ASSET_ADDRESS } from "../redux/endpoints/tokenTypes";
import { useTokenPairQuery } from "./useTokenPairQuery";
import { getNetworkDefaultTokenPair } from "../network/networks";

export const WrapTabDowngrade: FC = () => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const router = useRouter();
  const { visibleAddress } = useVisibleAddress();
  const { setTransactionDrawerOpen } = useLayoutContext();
  const getTransactionOverrides = useGetTransactionOverrides();
  const { connector: activeConnector } = useAccount();

  const {
    watch,
    control,
    formState,
    getValues,
    setValue,
    reset: resetForm,
    resetField,
  } = useFormContext<WrappingForm>();

  // The reason to set the type and clear errors is that a single form context is used both for wrapping and unwrapping.
  useEffect(() => {
    setValue("type", RestorationType.Downgrade, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, []);

  const [tokenPair, amount] = watch(["data.tokenPair", "data.amountDecimal"]);

  const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
    chainId: network.id,
  });
  const { superToken, underlyingToken } = useTokenPairQuery({
    network,
    tokenPair,
  });

  const [downgradeTrigger, downgradeResult] =
    rpcApi.useSuperTokenDowngradeMutation();
  const isDowngradeDisabled =
    !superToken ||
    !underlyingToken ||
    formState.isValidating ||
    !formState.isValid;

  const amountInputRef = useRef<HTMLInputElement>(undefined!);

  useEffect(() => {
    amountInputRef.current.focus();
  }, [amountInputRef, tokenPair]);

  const { data: _discard, ...realtimeBalanceQuery } =
    rpcApi.useRealtimeBalanceQuery(
      tokenPair && visibleAddress
        ? {
            chainId: network.id,
            accountAddress: visibleAddress,
            tokenAddress: tokenPair.superTokenAddress,
          }
        : skipToken
    );

  return (
    <Stack direction="column" alignItems="center">
      <WrapInputCard>
        <Stack direction="row" spacing={2}>
          <Controller
            control={control}
            name="data.amountDecimal"
            render={({ field: { onChange, onBlur } }) => (
              <Input
                data-cy={"unwrap-input"}
                fullWidth
                disableUnderline
                type="text"
                placeholder="0.0"
                inputMode="decimal"
                inputRef={amountInputRef}
                value={amount}
                onChange={onChange}
                onBlur={onBlur}
                inputProps={{
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
            name="data.tokenPair"
            render={({ field: { onChange, onBlur } }) => (
              <TokenDialogButton
                token={superToken}
                tokenSelection={{
                  tokenPairsQuery: {
                    data: tokenPairsQuery.data?.map((x) => x.superToken),
                    isUninitialized: tokenPairsQuery.isUninitialized,
                    isLoading: tokenPairsQuery.isLoading,
                  },
                }}
                onTokenSelect={(token) => {
                  resetField("data.amountDecimal");
                  const tokenPair = tokenPairsQuery?.data?.find(
                    (x) =>
                      x.superToken.address.toLowerCase() ===
                      token.address.toLowerCase()
                  );
                  if (tokenPair) {
                    onChange({
                      superTokenAddress: tokenPair.superToken.address,
                      underlyingTokenAddress: tokenPair.underlyingToken.address,
                    } as WrappingForm["data"]["tokenPair"]);
                  } else {
                    console.error(
                      "Token not selected for downgrade. This should never happen!"
                    );
                  }
                }}
                onBlur={onBlur}
                ButtonProps={{
                  variant:
                    theme.palette.mode === "light" ? "outlined" : "token",
                }}
              />
            )}
          />
        </Stack>
        {tokenPair && visibleAddress && (
          <Stack direction="row" justifyContent="flex-end" gap={0.5}>
            {/* <Typography variant="body2" color="text.secondary">
            ${Number(amount || 0).toFixed(2)}
          </Typography> */}

            <BalanceSuperToken
              chainId={network.id}
              accountAddress={visibleAddress}
              tokenAddress={tokenPair.superTokenAddress}
              TypographyProps={{ color: "text.secondary" }}
            />
            {realtimeBalanceQuery.currentData && (
              <Controller
                control={control}
                name="data.amountDecimal"
                render={({ field: { onChange, onBlur } }) => (
                  <Button
                    variant="textContained"
                    size="xxs"
                    onClick={() => {
                      const currentBalanceBigNumber = calculateCurrentBalance({
                        flowRateWei: realtimeBalanceQuery.currentData!.flowRate,
                        balanceWei: realtimeBalanceQuery.currentData!.balance,
                        balanceTimestampMs:
                          realtimeBalanceQuery.currentData!.balanceTimestamp,
                      });
                      return onChange(formatEther(currentBalanceBigNumber));
                    }}
                    onBlur={onBlur}
                  >
                    MAX
                  </Button>
                )}
              />
            )}
          </Stack>
        )}
      </WrapInputCard>

      <ArrowDownIcon />

      {underlyingToken && (
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
                <TokenIcon tokenSymbol={underlyingToken.symbol} size={24} />
              }
              sx={{ pointerEvents: "none" }}
            >
              {underlyingToken.symbol ?? ""}
            </Button>
          </Stack>

          {visibleAddress && (
            <Stack direction="row" justifyContent="flex-end">
              {/* <Typography variant="body2" color="text.secondary">
              ${Number(amount || 0).toFixed(2)}
            </Typography> */}
              <BalanceUnderlyingToken
                chainId={network.id}
                accountAddress={visibleAddress}
                tokenAddress={underlyingToken.address}
                decimals={underlyingToken.decimals}
              />
            </Stack>
          )}
        </WrapInputCard>
      )}

      {!!(superToken && underlyingToken) && (
        <Typography data-cy={"token-pair"} align="center" sx={{ my: 3 }}>
          {`1 ${superToken.symbol} = 1 ${underlyingToken.symbol}`}
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
          if (isDowngradeDisabled) {
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
            version: 2,
            chainId: network.id,
            tokenPair: formData.tokenPair,
            amountWei: parseEther(formData.amountDecimal).toString(),
          };

          const overrides = await getTransactionOverrides(network);

          // Fix for Gnosis Safe "cannot estimate gas" issue when downgrading native asset super tokens: https://github.com/superfluid-finance/superfluid-dashboard/issues/101
          const isGnosisSafe = activeConnector?.id === "safe";
          const isNativeAssetSuperToken =
            formData.tokenPair.underlyingTokenAddress === NATIVE_ASSET_ADDRESS;
          if (isGnosisSafe && isNativeAssetSuperToken) {
            overrides.gasLimit = 500_000;
          }

          downgradeTrigger({
            signer,
            chainId: network.id,
            amountWei: parseEther(formData.amountDecimal).toString(),
            superTokenAddress: formData.tokenPair.superTokenAddress,
            waitForConfirmation: true,
            transactionExtraData: {
              restoration,
            },
            overrides,
          })
            .unwrap()
            .then(() => resetForm());

          setTransactionDialogContent({
            label: (
              <DowngradePreview
                {...{
                  amountWei: parseEther(formData.amountDecimal).toString(),
                  superTokenSymbol: superToken.symbol,
                  underlyingTokenSymbol: underlyingToken.symbol,
                }}
              />
            ),
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
  amountWei: string;
  superTokenSymbol: string;
  underlyingTokenSymbol: string;
}> = ({ amountWei, superTokenSymbol, underlyingTokenSymbol }) => {
  return (
    <Typography variant="body2">
      You are downgrading from {formatEther(amountWei)} {superTokenSymbol} to
      the underlying token {underlyingTokenSymbol}.
    </Typography>
  );
};
