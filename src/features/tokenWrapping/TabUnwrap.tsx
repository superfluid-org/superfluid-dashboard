import { Button, Input, Stack, Typography, useTheme } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { formatEther, parseEther } from "ethers/lib/utils";
import { FC, useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { inputPropsForEtherAmount } from "../../utils/inputPropsForEtherAmount";
import {
  calculateCurrentBalance,
  parseAmountOrZero,
} from "../../utils/tokenUtils";
import { useAnalytics } from "../analytics/useAnalytics";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi, subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import FiatAmount from "../tokenPrice/FiatAmount";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import {
  RestorationType,
  SuperTokenDowngradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { BalanceSuperToken } from "./BalanceSuperToken";
import { BalanceUnderlyingToken } from "./BalanceUnderlyingToken";
import { SwitchWrapModeBtn } from "./SwitchWrapModeBtn";
import { TokenDialogButton } from "./TokenDialogButton";
import { useTokenPairQuery } from "./useTokenPairQuery";
import { WrapInputCard } from "./WrapInputCard";
import { ValidWrappingForm, WrappingForm } from "./WrappingFormProvider";
import { BigNumber } from "ethers";

interface TabUnwrapProps {
  onSwitchMode: () => void;
}

export const TabUnwrap: FC<TabUnwrapProps> = ({ onSwitchMode }) => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();
  const getTransactionOverrides = useGetTransactionOverrides();
  const { txAnalytics } = useAnalytics();

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
    setValue("type", RestorationType.Unwrap, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, []);

  const [tokenPair, amount] = watch(["data.tokenPair", "data.amountDecimal"]);

  const networkCustomTokens = useNetworkCustomTokens(network.id);

  const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
    chainId: network.id,
    unlistedTokenIDs: networkCustomTokens,
  });

  const { superToken, underlyingToken } = useTokenPairQuery({
    network,
    tokenPair,
  });

  const [unwrapTrigger, unwrapResult] = rpcApi.useSuperTokenDowngradeMutation();
  const isDowngradeDisabled =
    !superToken ||
    !underlyingToken ||
    formState.isValidating ||
    !formState.isValid;

  const amountInputRef = useRef<HTMLInputElement>(undefined!);

  const tokenPrice = useTokenPrice(network.id, tokenPair?.superTokenAddress);

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
  const realtimeBalance = realtimeBalanceQuery.currentData;

  const amountWei = parseAmountOrZero(
    amount ? { value: amount, decimals: 18 } : undefined
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
                inputRef={amountInputRef}
                value={amount}
                onChange={onChange}
                onBlur={onBlur}
                inputProps={{
                  ...inputPropsForEtherAmount,
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
                    isFetching: tokenPairsQuery.isFetching,
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
          <Stack direction="row" justifyContent="space-between" gap={0.5}>
            <Typography
              variant="body2mono"
              color="text.secondary"
              sx={{
                flexShrink: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tokenPrice && <FiatAmount wei={amountWei} price={tokenPrice} />}
            </Typography>

            <Stack direction="row">
              <BalanceSuperToken
                chainId={network.id}
                accountAddress={visibleAddress}
                tokenAddress={tokenPair.superTokenAddress}
                TypographyProps={{ color: "text.secondary" }}
              />
              {realtimeBalance && (
                <Controller
                  control={control}
                  name="data.amountDecimal"
                  render={({ field: { onChange, onBlur } }) => (
                    <Button
                      data-cy={"max-button"}
                      variant="textContained"
                      size="xxs"
                      onClick={() => {
                        // If the balance is flowing, subtract 3 minutes from the balance to account for the time it takes to send the transaction and also the clock skew.
                        // Note: 0 multiplied by 3 minutes is still 0.
                        const flowingBalanceSkew = BigNumber.from(
                          realtimeBalance.flowRate
                        )
                          .abs()
                          .mul(180);

                        const maxBalance = calculateCurrentBalance({
                          flowRateWei: realtimeBalance.flowRate,
                          balanceWei: realtimeBalance.balance,
                          balanceTimestamp: realtimeBalance.balanceTimestamp,
                        }).sub(flowingBalanceSkew);

                        return onChange(formatEther(maxBalance));
                      }}
                      onBlur={onBlur}
                    >
                      MAX
                    </Button>
                  )}
                />
              )}
            </Stack>
          </Stack>
        )}
      </WrapInputCard>

      <SwitchWrapModeBtn onClick={onSwitchMode} />

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
              translate="no"
            >
              {underlyingToken.symbol ?? ""}
            </Button>
          </Stack>

          {visibleAddress && (
            <Stack direction="row" justifyContent="space-between">
              <Typography
                variant="body2mono"
                color="text.secondary"
                sx={{
                  flexShrink: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {tokenPrice && (
                  <FiatAmount wei={amountWei} price={tokenPrice} />
                )}
              </Typography>
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
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Typography data-cy={"token-pair"} align="center" sx={{ my: 3 }}>
            {`1 ${superToken.symbol} = 1 ${underlyingToken.symbol}`}
          </Typography>
          {tokenPrice && (
            <Typography variant="body2mono" color="text.secondary">
              (<FiatAmount wei={1} decimals={0} price={tokenPrice} />)
            </Typography>
          )}
        </Stack>
      )}

      <ConnectionBoundary>
        <TransactionBoundary mutationResult={unwrapResult}>
          {({ setDialogLoadingInfo }) => (
            <TransactionButton
              dataCy={"downgrade-button"}
              disabled={isDowngradeDisabled}
              onClick={async (signer) => {
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
                  type: RestorationType.Unwrap,
                  version: 2,
                  chainId: network.id,
                  tokenPair: formData.tokenPair,
                  amountWei: parseEther(formData.amountDecimal).toString(),
                };

                const overrides = await getTransactionOverrides(network);

                setDialogLoadingInfo(
                  <UnwrapPreview
                    {...{
                      amountWei: parseEther(formData.amountDecimal).toString(),
                      superTokenSymbol: superToken.symbol,
                      underlyingTokenSymbol: underlyingToken.symbol,
                    }}
                  />
                );

                const primaryArgs = {
                  chainId: network.id,
                  amountWei: parseEther(formData.amountDecimal).toString(),
                  superTokenAddress: formData.tokenPair.superTokenAddress,
                };
                unwrapTrigger({
                  ...primaryArgs,
                  transactionExtraData: {
                    restoration,
                  },
                  signer,
                  overrides
                })
                  .unwrap()
                  .then(...txAnalytics("Unwrap", primaryArgs))
                  .then(() => resetForm())
                  .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
              }}
            >
              Unwrap
            </TransactionButton>
          )}
        </TransactionBoundary>
      </ConnectionBoundary>
    </Stack>
  );
};

const UnwrapPreview: FC<{
  amountWei: string;
  superTokenSymbol: string;
  underlyingTokenSymbol: string;
}> = ({ amountWei, superTokenSymbol, underlyingTokenSymbol }) => {
  return (
    <Typography
      data-cy={"unwrap-message"}
      variant="h5"
      color="text.secondary"
      translate="yes"
    >
      You are unwrapping{" "}
      <span translate="no">
        {formatEther(amountWei)} {superTokenSymbol}
      </span>{" "}
      to the underlying token{" "}
      <span translate="no">{underlyingTokenSymbol}</span>.
    </Typography>
  );
};
