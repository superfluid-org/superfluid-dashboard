import { yupResolver } from "@hookform/resolvers/yup";
import { BigNumber } from "ethers";
import { formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import { isString } from "lodash";
import { useRouter } from "next/router";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { object, ObjectSchema, string } from "yup";
import { createHandleHigherOrderValidationErrorFunc } from "../../utils/createHandleHigherOrderValidationErrorFunc";
import { dateNowSeconds } from "../../utils/dateUtils";
import {
  calculateCurrentBalance,
  calculateMaybeCriticalAtTimestamp,
  getMinimumStreamTimeInMinutes,
} from "../../utils/tokenUtils";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { getNetworkDefaultTokenPairs } from "../network/networks";
import { NATIVE_ASSET_ADDRESS } from "../redux/endpoints/tokenTypes";
import { rpcApi } from "../redux/store";
import {
  formRestorationOptions,
  RestorationType,
  SuperTokenDowngradeRestoration,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { useTokenPairsQuery } from "./useTokenPairsQuery";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { CommonFormEffects } from "../common/CommonFormEffects";

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

export type ValidWrappingForm = {
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
  const { network } = useExpectedNetwork();
  const router = useRouter();
  const { token: tokenQueryParam } = router.query;
  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryUnderlyingBalance] = rpcApi.useLazyUnderlyingBalanceQuery();
  const { visibleAddress } = useVisibleAddress();
  const { connector: activeConnector } = useAccount();

  const tokenPairsQuery = useTokenPairsQuery({
    network,
  });

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        const { type } = values as WrappingForm;

        const primarySchema: ObjectSchema<ValidWrappingForm> = object({
          data: object({
            tokenPair: object({
              superTokenAddress: string().required().test(testAddress()),
              underlyingTokenAddress: string().required().test(testAddress()),
            }).required(),
            amountDecimal: string()
              .required()
              .test(testEtherAmount({ notNegative: true, notZero: true })),
          }),
        });

        clearErrors("data");
        await primarySchema.validate(values);
        const validForm = values as ValidWrappingForm;

        const handleHigherOrderValidationError =
          createHandleHigherOrderValidationErrorFunc(
            setError,
            context.createError
          );

        const { superTokenAddress, underlyingTokenAddress } =
          validForm.data.tokenPair;

        if (visibleAddress) {
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
                validForm.data.tokenPair,
                null,
                2
              )}
The list of tokens searched from had length of: ${tokenPairsQuery.data.length}
The chain ID was: ${network.id}`);
              handleHigherOrderValidationError({
                message:
                  "Underlying token not found. This should never happen. Please refresh the page or contact support!",
              });
              return false;
            }

            const underlyingBalance = await queryUnderlyingBalance({
              accountAddress: visibleAddress,
              tokenAddress: underlyingTokenAddress,
              chainId: network.id,
            }).unwrap();

            const underlyingBalanceBigNumber = BigNumber.from(
              underlyingBalance.balance
            );
            const wrapAmountBigNumber = parseUnits(
              validForm.data.amountDecimal,
              underlyingToken.decimals
            );

            const isWrappingIntoNegative =
              underlyingBalanceBigNumber.lt(wrapAmountBigNumber);
            if (isWrappingIntoNegative) {
              handleHigherOrderValidationError({
                message: "You do not have enough balance.",
              });
            }

            const isNativeAsset =
              underlyingTokenAddress === NATIVE_ASSET_ADDRESS;
            if (isNativeAsset) {
              const isWrappingIntoZero = BigNumber.from(
                underlyingBalanceBigNumber
              ).eq(wrapAmountBigNumber);
              if (isWrappingIntoZero) {
                const isGnosisSafe = activeConnector?.id === "safe";
                if (!isGnosisSafe) {
                  // Not an issue on Gnosis Safe because gas is taken from another wallet.
                  handleHigherOrderValidationError({
                    message:
                      "You are wrapping out of native asset used for gas. You need to leave some gas tokens for the transaction to succeed.",
                  });
                }
              }
            }
          }

          if (type === RestorationType.Unwrap) {
            if (visibleAddress) {
              const realtimeBalance = await queryRealtimeBalance(
                {
                  accountAddress: visibleAddress,
                  chainId: network.id,
                  tokenAddress: validForm.data.tokenPair.superTokenAddress,
                },
                true
              ).unwrap();

              const flowRateBigNumber = BigNumber.from(
                realtimeBalance.flowRate
              );

              const currentBalanceBigNumber = calculateCurrentBalance({
                flowRateWei: flowRateBigNumber,
                balanceWei: BigNumber.from(realtimeBalance.balance),
                balanceTimestamp: realtimeBalance.balanceTimestamp,
              });
              const balanceAfterWrappingBigNumber = currentBalanceBigNumber.sub(
                parseEther(validForm.data.amountDecimal) // Always "ether" when downgrading. No need to worry about decimals for super tokens.
              );

              const amountBigNumber = parseEther(validForm.data.amountDecimal);
              const isWrappingIntoNegative =
                currentBalanceBigNumber.lt(amountBigNumber);
              if (isWrappingIntoNegative) {
                handleHigherOrderValidationError({
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
                  getMinimumStreamTimeInMinutes(network.bufferTimeInMinutes) *
                  60;
                const secondsToCritical =
                  dateWhenBalanceCritical.getTime() / 1000 - dateNowSeconds();

                if (secondsToCritical < minimumStreamTimeInSeconds) {
                  // NOTE: "secondsToCritical" might be off about 1 minute because of RTK-query cache for the balance query
                  handleHigherOrderValidationError({
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
      }),
    [network, visibleAddress, tokenPairsQuery.data]
  );

  const networkDefaultTokenPair = getNetworkDefaultTokenPairs(network)[0];
  const formMethods = useForm<WrappingForm, undefined, ValidWrappingForm>({
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
    resolver: yupResolver(formSchema as ObjectSchema<WrappingForm>),
  });

  const { setValue, clearErrors, setError } =
    formMethods;

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

  return hasRestored ? (
    <FormProvider {...formMethods}>
      {children}
      <CommonFormEffects />
    </FormProvider>
  ) : null;
};

export default WrappingFormProvider;
