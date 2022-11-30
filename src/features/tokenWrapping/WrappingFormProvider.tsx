import { yupResolver } from "@hookform/resolvers/yup";
import { BigNumber } from "ethers";
import { formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { debounce, isString } from "lodash";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { object, ObjectSchema, string } from "yup";
import {
  createHigherValidationErrorFunc,
  useHigherValidation,
} from "../../utils/higherValidation";
import { dateNowSeconds } from "../../utils/dateUtils";
import {
  calculateCurrentBalance,
  calculateMaybeCriticalAtTimestamp,
  getMinimumStreamTimeInMinutes,
} from "../../utils/tokenUtils";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { getNetworkDefaultTokenPair } from "../network/networks";
import { NATIVE_ASSET_ADDRESS } from "../redux/endpoints/tokenTypes";
import { rpcApi } from "../redux/store";
import {
  formRestorationOptions,
  RestorationType,
  SuperTokenDowngradeRestoration,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { useTokenPairsQuery } from "./useTokenPairsQuery";

export type WrappingForm = {
  type: RestorationType.Wrap | RestorationType.Unwrap;
  data: {
    tokenPair?: {
      superTokenAddress: string;
      underlyingTokenAddress: string;
    };
    amountDecimal?: string;
  };
};

export type SanitizedWrappingForm = {
  data: {
    tokenPair: {
      superTokenAddress: string;
      underlyingTokenAddress: string;
    };
    amountDecimal: string;
  };
};

const WrappingFormProvider: FC<
  PropsWithChildren<{
    restoration:
      | SuperTokenUpgradeRestoration
      | SuperTokenDowngradeRestoration
      | undefined;
  }>
> = ({ restoration, children }) => {
  const { network, stopAutoSwitchToWalletNetwork } = useExpectedNetwork();
  const router = useRouter();
  const { token: tokenQueryParam } = router.query;
  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryUnderlyingBalance] = rpcApi.useLazyUnderlyingBalanceQuery();
  const { address: accountAddress, connector: activeConnector } = useAccount();

  const tokenPairsQuery = useTokenPairsQuery({
    network,
  });

  const sanitizedSchema = useMemo<ObjectSchema<SanitizedWrappingForm>>(
    () =>
      object({
        data: object({
          tokenPair: object({
            superTokenAddress: string().required().test(testAddress()),
            underlyingTokenAddress: string().required().test(testAddress()),
          }).required(),
          amountDecimal: string()
            .required()
            .test(testEtherAmount({ notNegative: true, notZero: true })),
        }),
      }),
    []
  );

  const higherValidate = useHigherValidation<
    SanitizedWrappingForm & {
      type: RestorationType.Wrap | RestorationType.Unwrap;
    }
  >(
    async (sanitizedForm, handleError) => {
      const {
        type,
        data: {
          tokenPair: { superTokenAddress, underlyingTokenAddress },
        },
      } = sanitizedForm;

      if (accountAddress) {
        if (type === RestorationType.Wrap) {
          const { underlyingToken } =
            tokenPairsQuery.data.find(
              (x) =>
                x.superToken.address.toLowerCase() ===
                  superTokenAddress.toLowerCase() &&
                x.underlyingToken.address.toLowerCase() ===
                  underlyingTokenAddress.toLowerCase()
            ) ?? {};

          if (!underlyingToken) {
            console.error(`Couldn't find underlying token for: ${JSON.stringify(
              sanitizedForm.data.tokenPair,
              null,
              2
            )}
The list of tokens searched from had length of: ${tokenPairsQuery.data.length}
The chain ID was: ${network.id}`);
            return handleError({
              message:
                "Underlying token not found. This should never happen. Please refresh the page or contact support!",
            });
          }

          const underlyingBalance = await queryUnderlyingBalance({
            accountAddress,
            tokenAddress: underlyingTokenAddress,
            chainId: network.id,
          }).unwrap();

          const underlyingBalanceBigNumber = BigNumber.from(
            underlyingBalance.balance
          );
          const wrapAmountBigNumber = parseUnits(
            sanitizedForm.data.amountDecimal,
            underlyingToken.decimals
          );

          const isWrappingIntoNegative =
            underlyingBalanceBigNumber.lt(wrapAmountBigNumber);
          if (isWrappingIntoNegative) {
            return handleError({
              message: "You do not have enough balance.",
            });
          }

          const isNativeAsset = underlyingTokenAddress === NATIVE_ASSET_ADDRESS;
          if (isNativeAsset) {
            const isWrappingIntoZero = BigNumber.from(
              underlyingBalanceBigNumber
            ).eq(wrapAmountBigNumber);
            if (isWrappingIntoZero) {
              const isGnosisSafe = activeConnector?.id === "safe";
              if (!isGnosisSafe) {
                // Not an issue on Gnosis Safe because gas is taken from another wallet.
                return handleError({
                  message:
                    "You are wrapping out of native asset used for gas. You need to leave some gas tokens for the transaction to succeed.",
                });
              }
            }
          }
        }

        if (type === RestorationType.Unwrap) {
          if (accountAddress) {
            const realtimeBalance = await queryRealtimeBalance(
              {
                accountAddress,
                chainId: network.id,
                tokenAddress: sanitizedForm.data.tokenPair.superTokenAddress,
              },
              true
            ).unwrap();

            const flowRateBigNumber = BigNumber.from(realtimeBalance.flowRate);

            const currentBalanceBigNumber = calculateCurrentBalance({
              flowRateWei: flowRateBigNumber,
              balanceWei: BigNumber.from(realtimeBalance.balance),
              balanceTimestamp: realtimeBalance.balanceTimestamp,
            });
            const balanceAfterWrappingBigNumber = currentBalanceBigNumber.sub(
              parseEther(sanitizedForm.data.amountDecimal) // Always "ether" when downgrading. No need to worry about decimals for super tokens.
            );

            const amountBigNumber = parseEther(
              sanitizedForm.data.amountDecimal
            );
            const isWrappingIntoNegative =
              currentBalanceBigNumber.lt(amountBigNumber);
            if (isWrappingIntoNegative) {
              return handleError({
                message: "You do not have enough balance.",
              });
            }

            if (flowRateBigNumber.isNegative()) {
              const dateWhenBalanceCritical = new Date(
                calculateMaybeCriticalAtTimestamp({
                  balanceUntilUpdatedAtWei: balanceAfterWrappingBigNumber,
                  updatedAtTimestamp: realtimeBalance.balanceTimestamp,
                  totalNetFlowRateWei: flowRateBigNumber,
                })
                  .mul(1000)
                  .toNumber()
              );

              const minimumStreamTimeInSeconds =
                getMinimumStreamTimeInMinutes(network.bufferTimeInMinutes) * 60;
              const secondsToCritical =
                dateWhenBalanceCritical.getTime() / 1000 - dateNowSeconds();

              if (secondsToCritical < minimumStreamTimeInSeconds) {
                // NOTE: "secondsToCritical" might be off about 1 minute because of RTK-query cache for the balance query
                return handleError({
                  message: `You need to leave enough balance to stream for ${
                    minimumStreamTimeInSeconds / 3600
                  } hours.`,
                });
              }
            }
          }
        }
      }

      return true;
    },
    [
      network,
      accountAddress,
      activeConnector,
      tokenPairsQuery.data,
      queryUnderlyingBalance,
      queryRealtimeBalance,
    ]
  );

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        clearErrors("data");
        const sanitizedForm = await sanitizedSchema.validate(values);

        const handleHigherValidationError = createHigherValidationErrorFunc(
          setError,
          context.createError
        );

        const { type } = values as WrappingForm; // The type handling is weird and smelly...
        return await higherValidate(
          { ...sanitizedForm, type },
          handleHigherValidationError
        );
      }),
    [sanitizedSchema, higherValidate]
  );

  const networkDefaultTokenPair = getNetworkDefaultTokenPair(network);
  const formMethods = useForm<WrappingForm>({
    defaultValues: {
      data: {
        tokenPair: {
          superTokenAddress: networkDefaultTokenPair.superToken.address,
          underlyingTokenAddress:
            networkDefaultTokenPair.underlyingToken.address,
        },
        amountDecimal: "",
      },
    },
    mode: "onChange",
    resolver: yupResolver(formSchema),
  });

  const {
    formState: { isDirty: isFormDirty },
    setValue,
    trigger,
    clearErrors,
    setError,
    watch,
  } = formMethods;

  const [hasRestored, setHasRestored] = useState(!restoration);
  useEffect(() => {
    if (restoration && tokenPairsQuery.isSuccess) {
      const { superTokenAddress, underlyingTokenAddress } =
        restoration.tokenPair;
      const tokenPair = tokenPairsQuery.data.find(
        (x) =>
          x.superToken.address.toLowerCase() ===
            superTokenAddress.toLowerCase() &&
          x.underlyingToken.address.toLowerCase() ===
            underlyingTokenAddress.toLowerCase()
      );

      if (!tokenPair) {
        console.error(`Couldn't restore transaction. This shouldn't happen!`);
        return;
      }

      setValue("type", restoration.type, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValue("data.tokenPair", restoration.tokenPair, formRestorationOptions);
      setValue(
        "data.amountDecimal",
        formatUnits(restoration.amountWei, 18),
        formRestorationOptions
      );

      setHasRestored(true);
    }
  }, [restoration, tokenPairsQuery.isSuccess]);

  useEffect(() => {
    if (isString(tokenQueryParam) && tokenPairsQuery.isSuccess) {
      const tokenPair = tokenPairsQuery.data.find(
        (x) =>
          x.superToken.address.toLowerCase() === tokenQueryParam.toLowerCase()
      );

      if (tokenPair) {
        setValue(
          "data.tokenPair",
          {
            superTokenAddress: tokenPair.superToken.address,
            underlyingTokenAddress: tokenPair.underlyingToken.address,
          },
          formRestorationOptions
        );
      }

      const { token, ...tokenQueryParamRemoved } = router.query;
      router.replace({ query: tokenQueryParamRemoved }, undefined, {
        shallow: true,
      });
    }
  }, [tokenQueryParam, tokenPairsQuery.data]);

  useEffect(() => {
    if (isFormDirty) {
      stopAutoSwitchToWalletNetwork();
    }
  }, [isFormDirty]);

  useEffect(() => {
    if (isFormDirty) {
      trigger();
    }
  }, [accountAddress]);

  return hasRestored ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default WrappingFormProvider;
