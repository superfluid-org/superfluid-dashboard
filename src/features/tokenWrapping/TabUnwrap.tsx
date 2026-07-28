import { Button, Input, Stack, Typography, useTheme } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { formatEther, parseEther } from "ethers/lib/utils";
import { FC, memo, useEffect, useMemo, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { inputPropsForEtherAmount } from "../../utils/inputPropsForEtherAmount";
import {
  calculateCurrentBalance,
  parseAmountOrZero,
} from "../../utils/tokenUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
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
import { useTokenUnwrap } from "./useTokenWrapWrites";
import { NATIVE_ASSET_ADDRESS } from "../redux/endpoints/tokenTypes";
import { WrapInputCard } from "./WrapInputCard";
import { ValidWrappingForm, WrappingForm } from "./WrappingFormProvider";
import { BigNumber } from "ethers";
import { useTokenPairsQuery } from "./useTokenPairsQuery";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { Network } from "../network/networks";
import { RealtimeBalance } from "../redux/endpoints/balanceFetcher";
import { ClearMacroRelayOption } from "../clearMacro/ClearMacroRelayOption";
import { useClearMacroFeeFacts } from "../clearMacro/useClearMacroFeeFacts";

interface TabUnwrapProps {
  onSwitchMode: () => void;
}

export const TabUnwrap = memo(function TabUnwrap(props: TabUnwrapProps) {
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();

  const {
    watch,
    formState: { isValid, isValidating },
    getValues,
    setValue,
    reset: resetForm,
  } = useFormContext<WrappingForm>();

  // The reason to set the type and clear errors is that a single form context is used both for wrapping and unwrapping.
  useEffect(() => {
    setValue("type", RestorationType.Unwrap, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, [setValue]);

  const [tokenPair, amount] = watch(["data.tokenPair", "data.amountDecimal"]);

  const { superToken, underlyingToken } = useTokenPairQuery({
    network,
    tokenPair,
  });

  const [unwrapTrigger, unwrapResult] = useTokenUnwrap();

  const isDowngradeDisabled =
    !superToken || !underlyingToken || isValidating || !isValid;

  const tokenPrice = useTokenPrice(network.id, tokenPair?.superTokenAddress);

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

  // Chip only. MAX needs no equivalent: the fee token is a Wrapper Super Token, so its
  // `feeToken === superTokenAddress` check can never match a native-asset pair anyway.
  const relayActionKind =
    tokenPair?.underlyingTokenAddress === NATIVE_ASSET_ADDRESS
      ? undefined
      : ("downgrade" as const);

  return (
    <Stack direction="column" sx={{
      alignItems: "center"
    }}>
      <WrapInputCard>
        <Stack direction="row" spacing={2}>
          <UnwrapInputController />
          <UnwrapTokenController network={network} superToken={superToken} />
        </Stack>
        {tokenPair && visibleAddress && (
          <Stack
            direction="row"
            sx={{
              justifyContent: "space-between",
              gap: 0.5
            }}>
            <Typography
              variant="body2mono"
              sx={{
                color: "text.secondary",
                flexShrink: 1,
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
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
                <MaxAmountController
                  realtimeBalance={realtimeBalance}
                  network={network}
                  superTokenAddress={
                    tokenPair.superTokenAddress as `0x${string}`
                  }
                />
              )}
            </Stack>
          </Stack>
        )}
      </WrapInputCard>
      <SwitchWrapModeBtn onClick={props.onSwitchMode} />
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
              slotProps={{
                input: {
                  sx: {
                    ...theme.typography.largeInput,
                    p: 0,
                  },
                },
              }}
              sx={{ background: "transparent" }}
            />

            <Button
              variant={theme.palette.mode === "light" ? "outlined" : "token"}
              color="secondary"
              startIcon={
                <TokenIcon chainId={network.id} tokenAddress={underlyingToken.address} size={24} />
              }
              sx={{ pointerEvents: "none" }}
              translate="no"
            >
              {underlyingToken.symbol ?? ""}
            </Button>
          </Stack>

          {visibleAddress && (
            <Stack direction="row" sx={{
              justifyContent: "space-between"
            }}>
              <Typography
                variant="body2mono"
                sx={{
                  color: "text.secondary",
                  flexShrink: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
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
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            gap: 0.5
          }}>
          <Typography data-cy={"token-pair"} align="center" sx={{ my: 3 }}>
            {`1 ${superToken.symbol} = 1 ${underlyingToken.symbol}`}
          </Typography>
          {tokenPrice && (
            <Typography variant="body2mono" sx={{
              color: "text.secondary"
            }}>
              (<FiatAmount wei={1} decimals={0} price={tokenPrice} />)
            </Typography>
          )}
        </Stack>
      )}
      <ConnectionBoundary>
        {/* 2.5 matches the block rhythm around TX buttons app-wide so the relay
            strip reads as its own block rather than hugging the button. */}
        <Stack
          sx={{
            gap: 2.5,
            width: "100%"
          }}>
          <TransactionBoundary mutationResult={unwrapResult}>
            {({ setDialogLoadingInfo, txAnalytics }) => (
              <TransactionButton
                dataCy={"downgrade-button"}
                disabled={isDowngradeDisabled}
                onClick={async () => {
                  if (isDowngradeDisabled) {
                    throw Error(
                      `This should never happen.`
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

                  setDialogLoadingInfo(
                    <UnwrapPreview
                      {...{
                        amountWei: parseEther(formData.amountDecimal).toString(),
                        superTokenSymbol: superToken!.symbol,
                        underlyingTokenSymbol: underlyingToken!.symbol,
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
                    isNativeAssetUnderlyingToken:
                      formData.tokenPair.underlyingTokenAddress ===
                      NATIVE_ASSET_ADDRESS,
                    transactionExtraData: {
                      restoration,
                    },
                  })
                    .then(...txAnalytics("Unwrap", primaryArgs))
                    .then(() => resetForm())
                    .catch((error) => void error); // Error is already logged and handled in the middleware & UI.
                }}
              >
                Unwrap
              </TransactionButton>
            )}
          </TransactionBoundary>
          <ClearMacroRelayOption
            actionKind={relayActionKind}
            network={network}
          />
        </Stack>
      </ConnectionBoundary>
    </Stack>
  );
})

const UnwrapPreview: FC<{
  amountWei: string;
  superTokenSymbol: string;
  underlyingTokenSymbol: string;
}> = ({ amountWei, superTokenSymbol, underlyingTokenSymbol }) => {
  return (
    <Typography
      data-cy={"unwrap-message"}
      variant="h5"
      translate="yes"
      sx={{
        color: "text.secondary"
      }}
    >You are unwrapping{" "}
      <span translate="no">
        {formatEther(amountWei)} {superTokenSymbol}
      </span>{" "}to the underlying token{" "}
      <span translate="no">{underlyingTokenSymbol}</span>.
          </Typography>
  );
};

const UnwrapInputController = memo(function UnwrapInputController() {
  const theme = useTheme();
  const { control, watch } = useFormContext<WrappingForm>();
  const [tokenPair, amount] = watch(["data.tokenPair", "data.amountDecimal"]);

  const amountInputRef = useRef<HTMLInputElement>(undefined!);

  useEffect(() => {
    amountInputRef.current.focus();
  }, [amountInputRef, tokenPair]);

  return (
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
          slotProps={{
            input: {
              ...inputPropsForEtherAmount,
              sx: {
                ...theme.typography.largeInput,
                p: 0,
              },
            },
          }}
          sx={{ background: "transparent" }}
        />
      )}
    />
  )
})

const UnwrapTokenController = memo(function UnwrapTokenController(props: {
  network: Network;
  superToken: SuperTokenMinimal | null | undefined;
}) {
  const theme = useTheme();
  const { control, resetField } = useFormContext<WrappingForm>();

  const tokenPairsQuery = useTokenPairsQuery({
    network: props.network
  })

  const superTokens = useMemo(() => tokenPairsQuery.data?.map((x) => x.superToken), [tokenPairsQuery.data])

  return (
    <Controller
      control={control}
      name="data.tokenPair"
      render={({ field: { onChange, onBlur } }) => (
        <TokenDialogButton
          network={props.network}
          token={props.superToken}
          tokens={superTokens}
          isTokensFetching={tokenPairsQuery.isFetching}
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
  )
})

const MaxAmountController = memo(function MaxAmountController(props: {
  realtimeBalance: RealtimeBalance;
  network: Network;
  superTokenAddress: `0x${string}`;
}) {
  const { control } = useFormContext<WrappingForm>();
  // Best-effort convenience only: leave the relay fee behind so MAX lands on a submittable
  // amount. Correctness is the form's fee validation, which re-runs — if this is stale or
  // zero, the user gets an explanatory error instead of an unsubmittable form.
  const feeFacts = useClearMacroFeeFacts(props.network);
  const feeReservationWei =
    feeFacts.couldPayFromSuperToken &&
    feeFacts.feeWei != null &&
    feeFacts.feeToken?.toLowerCase() === props.superTokenAddress.toLowerCase()
      ? feeFacts.feeWei
      : 0n;

  return (
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
              props.realtimeBalance.flowRate
            )
              .abs()
              .mul(180);

            const maxBalance = calculateCurrentBalance({
              flowRateWei: props.realtimeBalance.flowRate,
              balanceWei: props.realtimeBalance.balance,
              balanceTimestamp: props.realtimeBalance.balanceTimestamp,
            })
              .sub(flowingBalanceSkew)
              .sub(BigNumber.from(feeReservationWei.toString()));

            // A balance at or below the fee has no relayable maximum; clamp rather than
            // offer a negative amount the form would reject as malformed.
            return onChange(
              formatEther(maxBalance.isNegative() ? BigNumber.from(0) : maxBalance)
            );
          }}
          onBlur={onBlur}
        >
          MAX
        </Button>
      )}
    />
  )
})
