import { Button, Input, Stack, Typography, useTheme } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { formatEther, formatUnits, parseEther } from "ethers/lib/utils";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { inputPropsForEtherAmount } from "../../utils/inputPropsForEtherAmount";
import { parseAmountOrZero } from "../../utils/tokenUtils";
import { useAnalytics } from "../analytics/useAnalytics";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { useLayoutContext } from "../layout/LayoutContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import {
  NATIVE_ASSET_ADDRESS,
  SuperTokenPair,
} from "../redux/endpoints/tokenTypes";
import { rpcApi, subgraphApi } from "../redux/store";
import TokenIcon from "../token/TokenIcon";
import { useTokenIsListed } from "../token/useTokenIsListed";
import FiatAmount from "../tokenPrice/FiatAmount";
import useTokenPrice from "../tokenPrice/useTokenPrice";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import {
  TransactionDialogActions,
  TransactionDialogButton,
} from "../transactionBoundary/TransactionDialog";
import {
  ApproveAllowanceRestoration,
  RestorationType,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { BalanceSuperToken } from "./BalanceSuperToken";
import { BalanceUnderlyingToken } from "./BalanceUnderlyingToken";
import { SwitchWrapModeBtn } from "./SwitchWrapModeBtn";
import { TokenDialogButton } from "./TokenDialogButton";
import { useTokenPairQuery } from "./useTokenPairQuery";
import { WrapInputCard } from "./WrapInputCard";
import { ValidWrappingForm, WrappingForm } from "./WrappingFormProvider";

const underlyingIbAlluoTokenOverrides = [
  // StIbAlluoEth
  "0xc677b0918a96ad258a68785c2a3955428dea7e50",
  // StIbAlluoBTC
  "0xf272ff86c86529504f0d074b210e95fc4cfcdce2",

  // StIbAlluoEUR
  "0xc9d8556645853c465d1d5e7d2c81a0031f0b8a92",

  // StIbAlluoUSD
  "0xc2dbaaea2efa47ebda3e572aa0e55b742e408bf6",
];

interface TabWrapProps {
  onSwitchMode: () => void;
}

export const TabWrap: FC<TabWrapProps> = ({ onSwitchMode }) => {
  const theme = useTheme();
  const { network } = useExpectedNetwork();
  const router = useRouter();
  const { visibleAddress } = useVisibleAddress();
  const { setTransactionDrawerOpen } = useLayoutContext();
  const getTransactionOverrides = useGetTransactionOverrides();
  const { txAnalytics } = useAnalytics();

  const {
    watch,
    control,
    reset: resetForm,
    resetField,
    formState,
    getValues,
    setValue,
  } = useFormContext<WrappingForm>();

  // The reason to set the type and clear errors is that a single form context is used both for wrapping and unwrapping.
  useEffect(() => {
    setValue("type", RestorationType.Wrap, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, []);

  const [tokenPair, amountDecimal] = watch([
    "data.tokenPair",
    "data.amountDecimal",
  ]);

  const [amountWei, setAmountWei] = useState<BigNumber>( // The wei is based on the underlying token, so be careful with decimals.
    ethers.BigNumber.from(0)
  );

  const networkCustomTokens = useNetworkCustomTokens(network.id);
  const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
    chainId: network.id,
    unlistedTokenIDs: networkCustomTokens,
  });

  const { superToken, underlyingToken } = useTokenPairQuery({
    network,
    tokenPair,
  });

  const tokenPrice = useTokenPrice(network.id, tokenPair?.superTokenAddress); // We always get the price for the super token.

  useEffect(() => {
    if (underlyingToken && amountDecimal) {
      setAmountWei(
        parseAmountOrZero({
          value: amountDecimal,
          decimals: underlyingToken.decimals,
        })
      );
    } else {
      setAmountWei(BigNumber.from("0"));
    }
  }, [amountDecimal, underlyingToken]);

  const isUnderlyingBlockchainNativeAsset =
    tokenPair?.underlyingTokenAddress === NATIVE_ASSET_ADDRESS;

  const { data: _discard, ...allowanceQuery } =
    rpcApi.useSuperTokenUpgradeAllowanceQuery(
      tokenPair && !isUnderlyingBlockchainNativeAsset && visibleAddress
        ? {
            chainId: network.id,
            accountAddress: visibleAddress,
            superTokenAddress: tokenPair.superTokenAddress,
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
  const [wrapTrigger, wrapResult] = rpcApi.useSuperTokenUpgradeMutation();

  const isApproveAllowanceVisible = !!(
    underlyingToken &&
    tokenPair &&
    !amountWei.isZero() &&
    currentAllowance &&
    missingAllowance &&
    missingAllowance.gt(0)
  );

  const isWrapButtonDisabled =
    !tokenPair ||
    !underlyingToken ||
    !superToken ||
    formState.isValidating ||
    !formState.isValid ||
    isApproveAllowanceVisible ||
    allowanceQuery.isLoading;

  const amountInputRef = useRef<HTMLInputElement>(undefined!);

  useEffect(() => {
    amountInputRef.current.focus();
  }, [amountInputRef, tokenPair]);

  const tokenSelection = useMemo(() => {
    const tokenPairs = tokenPairsQuery.data || [];

    /**
     * Filtering out duplicate pairs with the same underlying tokens due to UI limitations.
     * If pair with same underlying token already exists then...
     * a) If super token is listed then we will overwrite the existing pair.
     * b) If super token is not listed then we will skip it.
     */
    return tokenPairs
      .reduce((allowedTokenPairs, tokenPair) => {
        const existingPairIndex = allowedTokenPairs.findIndex(
          (tp) =>
            tp.underlyingToken.address === tokenPair.underlyingToken.address
        );

        if (existingPairIndex >= 0) {
          if (tokenPair.superToken.isListed) {
            allowedTokenPairs.splice(existingPairIndex, 1, tokenPair);
          }
          return allowedTokenPairs;
        }
        return allowedTokenPairs.concat([tokenPair]);
      }, [] as SuperTokenPair[])
      .map((x) => x.underlyingToken);
  }, [tokenPairsQuery.data]);

  const { underlyingBalance } = rpcApi.useUnderlyingBalanceQuery(
    tokenPair && visibleAddress
      ? {
          chainId: network.id,
          accountAddress: visibleAddress,
          tokenAddress: tokenPair.underlyingTokenAddress,
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        underlyingBalance: result.currentData?.balance,
      }),
    }
  );

  const [isListed, isListedLoading] = useTokenIsListed(
    network.id,
    tokenPair?.superTokenAddress
  );

  return (
    <Stack data-cy={"wrap-screen"} direction="column" alignItems="center">
      <WrapInputCard>
        <Stack direction="row" spacing={2}>
          <Controller
            control={control}
            name="data.amountDecimal"
            render={({ field: { onChange, onBlur } }) => (
              <Input
                data-cy={"wrap-input"}
                fullWidth
                disableUnderline
                placeholder="0.0"
                inputRef={amountInputRef}
                value={amountDecimal}
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
                network={network}
                token={underlyingToken}
                tokenSelection={{
                  tokenPairsQuery: {
                    data: tokenSelection,
                    isFetching: tokenPairsQuery.isFetching,
                  },
                }}
                onTokenSelect={(token) => {
                  resetField("data.amountDecimal");
                  const tokenPair = tokenPairsQuery?.data?.find(
                    (x) =>
                      x.underlyingToken.address.toLowerCase() ===
                      token.address.toLowerCase()
                  );
                  if (tokenPair) {
                    onChange({
                      superTokenAddress: tokenPair.superToken.address,
                      underlyingTokenAddress: tokenPair.underlyingToken.address,
                    } as WrappingForm["data"]["tokenPair"]);
                  } else {
                    console.error(
                      "Token not selected for upgrade. This should never happen!"
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
        {underlyingToken && visibleAddress && (
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
              {tokenPrice && (
                <FiatAmount
                  wei={amountWei}
                  decimals={underlyingToken.decimals}
                  price={tokenPrice}
                />
              )}
            </Typography>
            <Stack direction="row">
              <BalanceUnderlyingToken
                chainId={network.id}
                accountAddress={visibleAddress}
                tokenAddress={underlyingToken.address}
                decimals={underlyingToken.decimals}
              />
              {underlyingBalance && (
                <Controller
                  control={control}
                  name="data.amountDecimal"
                  render={({ field: { onChange, onBlur } }) => (
                    <Button
                      data-cy={"max-button"}
                      variant="textContained"
                      size="xxs"
                      onClick={() => {
                        return onChange(
                          formatUnits(
                            underlyingBalance,
                            underlyingToken.decimals
                          ) as WrappingForm["data"]["amountDecimal"]
                        );
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

      {superToken && (
        <WrapInputCard>
          <Stack direction="row" spacing={2}>
            <Input
              data-cy={"wrapable-amount"}
              disabled
              fullWidth
              disableUnderline
              placeholder="0.0"
              value={amountDecimal}
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
                  isSuper
                  tokenSymbol={superToken.symbol}
                  isUnlisted={!isListed}
                  isLoading={isListedLoading}
                  size={24}
                />
              }
              sx={{ pointerEvents: "none" }}
              translate="no"
            >
              {superToken.symbol ?? ""}
            </Button>
          </Stack>

          {!!(underlyingToken && superToken && visibleAddress) && (
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
                  <FiatAmount
                    wei={amountWei}
                    decimals={underlyingToken.decimals}
                    price={tokenPrice}
                  />
                )}
              </Typography>
              <BalanceSuperToken
                chainId={network.id}
                accountAddress={visibleAddress}
                tokenAddress={superToken.address}
                TypographyProps={{ color: "text.secondary" }}
              />
            </Stack>
          )}
        </WrapInputCard>
      )}

      {!!(superToken && underlyingToken) && (
        <Stack direction="row" alignItems="center" gap={0.5}>
          <Typography data-cy="token-pair" align="center" sx={{ my: 3 }}>
            {`1 ${underlyingToken.symbol} = 1 ${superToken.symbol}`}
          </Typography>
          {tokenPrice && (
            <Typography variant="body2mono" color="text.secondary">
              (
              <FiatAmount
                wei={amountWei}
                decimals={underlyingToken.decimals}
                price={tokenPrice}
              />
              )
            </Typography>
          )}
        </Stack>
      )}

      <Stack gap={2} direction="column" sx={{ width: "100%" }}>
        <ConnectionBoundary>
          <TransactionBoundary mutationResult={approveResult}>
            {({ setDialogLoadingInfo }) =>
              isApproveAllowanceVisible && (
                <TransactionButton
                  dataCy={"approve-allowance-button"}
                  onClick={async (signer) => {
                    const approveAllowanceAmountWei =
                      currentAllowance.add(missingAllowance);

                    setDialogLoadingInfo(
                      <AllowancePreview
                        {...{
                          amountWei: approveAllowanceAmountWei.toString(),
                          decimals: underlyingToken.decimals,
                          tokenSymbol: underlyingToken.symbol,
                        }}
                      />
                    );

                    const restoration: ApproveAllowanceRestoration = {
                      type: RestorationType.Approve,
                      chainId: network.id,
                      amountWei: approveAllowanceAmountWei.toString(),
                      tokenAddress: tokenPair.underlyingTokenAddress,
                    };

                    const primaryArgs = {
                      chainId: network.id,
                      amountWei: approveAllowanceAmountWei.toString(),
                      superTokenAddress: tokenPair.superTokenAddress,
                    };
                    approveTrigger({
                      ...primaryArgs,
                      transactionExtraData: {
                        restoration,
                      },
                      signer,
                      overrides: await getTransactionOverrides(network),
                    })
                      .unwrap()
                      .then(...txAnalytics("Approve Allowance", primaryArgs))
                      .then(() => setTransactionDrawerOpen(true))
                      .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.
                  }}
                >
                  Allow Superfluid Protocol to wrap your{" "}
                  {underlyingToken.symbol}
                </TransactionButton>
              )
            }
          </TransactionBoundary>

          <TransactionBoundary mutationResult={wrapResult}>
            {({
              closeDialog,
              setDialogLoadingInfo,
              setDialogSuccessActions,
            }) => (
              <TransactionButton
                dataCy={"upgrade-button"}
                disabled={isWrapButtonDisabled}
                onClick={async (signer) => {
                  if (isWrapButtonDisabled) {
                    throw Error(
                      `This should never happen. Form state: ${JSON.stringify(
                        formState,
                        null,
                        2
                      )}`
                    );
                  }

                  const { data: formData } = getValues() as ValidWrappingForm;

                  // Use super token's decimals for upgrading, not the underlying's.
                  const amountWei = parseEther(formData.amountDecimal);

                  const restoration: SuperTokenUpgradeRestoration = {
                    type: RestorationType.Wrap,
                    version: 2,
                    chainId: network.id,
                    tokenPair: tokenPair,
                    amountWei: amountWei.toString(),
                  };

                  const overrides = await getTransactionOverrides(network);

                  // Temp custom override for "IbAlluo" tokens on polygon
                  // TODO: Find a better solution
                  if (
                    network.id === 137 &&
                    underlyingIbAlluoTokenOverrides.includes(
                      tokenPair.underlyingTokenAddress.toLowerCase()
                    )
                  ) {
                    overrides.gasLimit = 200_000;
                  }

                  setDialogLoadingInfo(
                    <WrapPreview
                      {...{
                        amountWei: amountWei,
                        superTokenSymbol: superToken.symbol,
                        underlyingTokenSymbol: underlyingToken.symbol,
                      }}
                    />
                  );

                  const primaryArgs = {
                    chainId: network.id,
                    amountWei: amountWei.toString(),
                    superTokenAddress: formData.tokenPair.superTokenAddress,
                  };
                  wrapTrigger({
                    ...primaryArgs,
                    transactionExtraData: {
                      restoration,
                    },
                    signer,
                    overrides
                  })
                    .unwrap()
                    .then(...txAnalytics("Wrap", primaryArgs))
                    .then(() => resetForm())
                    .catch((error: unknown) => void error); // Error is already logged and handled in the middleware & UI.

                  setDialogSuccessActions(
                    <TransactionDialogActions>
                      <Stack gap={1} sx={{ width: "100%" }}>
                        <TransactionDialogButton
                          data-cy={"wrap-more-tokens-button"}
                          color="secondary"
                          onClick={closeDialog}
                        >
                          Wrap more tokens
                        </TransactionDialogButton>
                        <TransactionDialogButton
                          data-cy={"go-to-tokens-page-button"}
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
                  );
                }}
              >
                Wrap
              </TransactionButton>
            )}
          </TransactionBoundary>
        </ConnectionBoundary>
      </Stack>
    </Stack>
  );
};

const WrapPreview: FC<{
  amountWei: BigNumberish;
  underlyingTokenSymbol: string;
  superTokenSymbol: string;
}> = ({ underlyingTokenSymbol, superTokenSymbol, amountWei }) => {
  return (
    <Typography
      data-cy="wrap-message"
      variant="h5"
      color="text.secondary"
      translate="yes"
    >
      You are wrapping{" "}
      <span translate="no">
        {formatEther(amountWei)} {underlyingTokenSymbol}
      </span>{" "}
      to the super token <span translate="no">{superTokenSymbol}</span>.
    </Typography>
  );
};

const AllowancePreview: FC<{
  amountWei: BigNumberish;
  decimals: number;
  tokenSymbol: string;
}> = ({ amountWei, decimals, tokenSymbol }) => {
  return (
    <Typography
      data-cy="allowance-message"
      variant="h5"
      color="text.secondary"
      translate="yes"
    >
      You are approving additional allowance of{" "}
      <span translate="no">
        {formatUnits(amountWei, decimals)} {tokenSymbol}
      </span>{" "}
      for Superfluid Protocol to use.
    </Typography>
  );
};
