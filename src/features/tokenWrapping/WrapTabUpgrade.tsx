import { Button, Input, Stack, Typography, useTheme } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query";
import { BigNumber, BigNumberish, ethers } from "ethers";
import { formatEther, formatUnits, parseEther } from "ethers/lib/utils";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useAccount } from "wagmi";
import useGetTransactionOverrides from "../../hooks/useGetTransactionOverrides";
import { parseAmountOrZero } from "../../utils/tokenUtils";
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
import { TokenDialogButton } from "./TokenDialogButton";
import { useTokenPairQuery } from "./useTokenPairQuery";
import { ArrowDownIcon, WrapInputCard } from "./WrapCard";
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

export const WrapTabUpgrade: FC = () => {
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
    reset: resetForm,
    resetField,
    formState,
    getValues,
    setValue,
  } = useFormContext<WrappingForm>();

  // The reason to set the type and clear errors is that a single form context is used both for wrapping and unwrapping.
  useEffect(() => {
    setValue("type", RestorationType.Upgrade, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });
  }, []);

  const [tokenPair, amountDecimal] = watch([
    "data.tokenPair",
    "data.amountDecimal",
  ]);

  const [amountWei, setAmountWei] = useState<BigNumber>(
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

  const [upgradeTrigger, upgradeResult] = rpcApi.useSuperTokenUpgradeMutation();

  const isApproveAllowanceVisible = !!(
    underlyingToken &&
    tokenPair &&
    !amountWei.isZero() &&
    currentAllowance &&
    missingAllowance &&
    missingAllowance.gt(0)
  );

  const isUpgradeDisabled =
    !tokenPair ||
    !underlyingToken ||
    !superToken ||
    formState.isValidating ||
    !formState.isValid ||
    !!isApproveAllowanceVisible;

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
    <Stack direction="column" alignItems="center">
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
                type="text"
                inputMode="decimal"
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
          <Stack direction="row" justifyContent="flex-end" gap={0.5}>
            {/* <Typography variant="body2" color="text.secondary">
            ${Number(amount || 0).toFixed(2)}
          </Typography> */}
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
        )}
      </WrapInputCard>

      <ArrowDownIcon />

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
                  tokenSymbol={superToken.symbol}
                  isUnlisted={!isListed}
                  isLoading={isListedLoading}
                  size={24}
                />
              }
              sx={{ pointerEvents: "none" }}
            >
              {superToken.symbol ?? ""}
            </Button>
          </Stack>

          {!!(superToken && visibleAddress) && (
            <Stack direction="row" justifyContent="flex-end">
              {/* <Typography variant="body2" color="text.secondary">
              ${Number(amount || 0).toFixed(2)}
            </Typography> */}
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
        <Typography data-cy="token-pair" align="center" sx={{ my: 3 }}>
          {`1 ${underlyingToken.symbol} = 1 ${superToken.symbol}`}
        </Typography>
      )}

      <Stack gap={2} direction="column" sx={{ width: "100%" }}>
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

                  approveTrigger({
                    signer,
                    chainId: network.id,
                    amountWei: approveAllowanceAmountWei.toString(),
                    superTokenAddress: tokenPair.superTokenAddress,
                    transactionExtraData: {
                      restoration,
                    },
                    overrides: await getTransactionOverrides(network),
                  })
                    .unwrap()
                    .then(() => setTransactionDrawerOpen(true));
                }}
              >
                Approve Allowance
              </TransactionButton>
            )
          }
        </TransactionBoundary>

        <TransactionBoundary mutationResult={upgradeResult}>
          {({ closeDialog, setDialogLoadingInfo, setDialogSuccessActions }) => (
            <TransactionButton
              dataCy={"upgrade-button"}
              disabled={isUpgradeDisabled}
              onClick={async (signer) => {
                if (isUpgradeDisabled) {
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
                  type: RestorationType.Upgrade,
                  version: 2,
                  chainId: network.id,
                  tokenPair: tokenPair,
                  amountWei: amountWei.toString(),
                };

                const overrides = await getTransactionOverrides(network);

                // In Gnosis Safe, Ether's estimateGas is flaky for native assets.
                const isGnosisSafe = activeConnector?.id === "safe";
                const isNativeAssetSuperToken =
                  formData.tokenPair.underlyingTokenAddress ===
                  NATIVE_ASSET_ADDRESS;

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

                if (isGnosisSafe && isNativeAssetSuperToken) {
                  overrides.gasLimit = 500_000;
                }

                setDialogLoadingInfo(
                  <UpgradePreview
                    {...{
                      amountWei: amountWei,
                      superTokenSymbol: superToken.symbol,
                      underlyingTokenSymbol: underlyingToken.symbol,
                    }}
                  />
                );

                upgradeTrigger({
                  signer,
                  chainId: network.id,
                  amountWei: amountWei.toString(),
                  superTokenAddress: formData.tokenPair.superTokenAddress,
                  waitForConfirmation: true,
                  transactionExtraData: {
                    restoration,
                  },
                  overrides,
                })
                  .unwrap()
                  .then(() => resetForm());

                setDialogSuccessActions(
                  <TransactionDialogActions>
                    <Stack gap={1} sx={{ width: "100%" }}>
                      <TransactionDialogButton
                        color="secondary"
                        onClick={closeDialog}
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
                );
              }}
            >
              Upgrade to Super Token
            </TransactionButton>
          )}
        </TransactionBoundary>
      </Stack>
    </Stack>
  );
};

const UpgradePreview: FC<{
  amountWei: BigNumberish;
  underlyingTokenSymbol: string;
  superTokenSymbol: string;
}> = ({ underlyingTokenSymbol, superTokenSymbol, amountWei }) => {
  return (
    <Typography variant="h5" color="text.secondary">
      You are upgrading from {formatEther(amountWei)} {underlyingTokenSymbol} to
      the super token {superTokenSymbol}.
    </Typography>
  );
};

const AllowancePreview: FC<{
  amountWei: BigNumberish;
  decimals: number;
  tokenSymbol: string;
}> = ({ amountWei, decimals, tokenSymbol }) => {
  return (
    <Typography variant="h5" color="text.secondary">
      You are approving extra allowance of {formatUnits(amountWei, decimals)}{" "}
      {tokenSymbol} for Superfluid Protocol to use.
    </Typography>
  );
};
