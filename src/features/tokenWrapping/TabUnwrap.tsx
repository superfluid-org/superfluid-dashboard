import { Button, Input, Stack, Typography, useTheme } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { formatEther, parseEther } from "ethers/lib/utils";
import { FC, useEffect, useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useAccount } from "wagmi";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { calculateCurrentBalance } from "../../utils/tokenUtils";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { NATIVE_ASSET_ADDRESS } from "../redux/endpoints/tokenTypes";
import { rpcApi, subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
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

interface TabUnwrapProps {
  onSwitchMode: () => void;
}

export const TabUnwrap: FC<TabUnwrapProps> = ({
  onSwitchMode,
}) => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const { visibleAddress } = useVisibleAddress();
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

  const [unwrapTrigger, unwrapResult] =
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
                    data-cy={"max-button"}
                    variant="textContained"
                    size="xxs"
                    onClick={() => {
                      const currentBalanceBigNumber = calculateCurrentBalance({
                        flowRateWei: realtimeBalanceQuery.currentData!.flowRate,
                        balanceWei: realtimeBalanceQuery.currentData!.balance,
                        balanceTimestamp:
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

              const isNativeAssetSuperToken =
                formData.tokenPair.underlyingTokenAddress ===
                NATIVE_ASSET_ADDRESS;

              setDialogLoadingInfo(
                <UnwrapPreview
                  {...{
                    amountWei: parseEther(formData.amountDecimal).toString(),
                    superTokenSymbol: superToken.symbol,
                    underlyingTokenSymbol: underlyingToken.symbol,
                  }}
                />
              );

              unwrapTrigger({
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
            }}
          >
            Unwrap
          </TransactionButton>
        )}
      </TransactionBoundary>
    </Stack>
  );
};

const UnwrapPreview: FC<{
  amountWei: string;
  superTokenSymbol: string;
  underlyingTokenSymbol: string;
}> = ({ amountWei, superTokenSymbol, underlyingTokenSymbol }) => {
  return (
    <Typography data-cy={"unwrap-message"} variant="h5" color="text.secondary" translate="yes">
      You are unwrapping {" "}
      <span translate="no">
        {formatEther(amountWei)} {superTokenSymbol}
      </span>{" "}
      to the underlying token{" "}
      <span translate="no">{underlyingTokenSymbol}</span>.
    </Typography>
  );
};
