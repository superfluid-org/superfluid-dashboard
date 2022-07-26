import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { object, ObjectSchema, string } from "yup";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import {
  formRestorationOptions,
  RestorationType,
  SuperTokenDowngradeRestoration,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { getNetworkDefaultTokenPair } from "../network/networks";
import { isString } from "lodash";
import { rpcApi, subgraphApi } from "../redux/store";
import { formatEther, parseUnits } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { BigNumber } from "ethers";
import { NATIVE_ASSET_ADDRESS } from "../redux/endpoints/tokenTypes";
import {
  calculateCurrentBalance,
  calculateMaybeCriticalAtTimestamp,
} from "../../utils/tokenUtils";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";

export type WrappingForm = {
  type: RestorationType.Downgrade | RestorationType.Upgrade;
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

const WrappingFormProvider: FC<{
  restoration:
    | SuperTokenUpgradeRestoration
    | SuperTokenDowngradeRestoration
    | undefined;
}> = ({ restoration, children }) => {
  const { network, stopAutoSwitchToAccountNetwork } = useExpectedNetwork();
  const router = useRouter();
  const { token: tokenQueryParam } = router.query;
  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryUnderlyingBalance] = rpcApi.useLazyUnderlyingBalanceQuery();
  const [queryToken] = subgraphApi.useLazyTokenQuery();
  const { address: accountAddress, connector: activeConnector } = useAccount();

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

        // # Higher order validation
        const handleHigherOrderValidationError = ({
          message,
        }: {
          message: string;
        }) => {
          setError("data", {
            message: message,
          });
          throw context.createError({
            path: "data",
            message: message,
          });
        };

        if (accountAddress) {
          if (type === RestorationType.Upgrade) {
            const underlyingTokenAddress =
              validForm.data.tokenPair.underlyingTokenAddress;

            const [underlyingToken, underlyingBalance] = await Promise.all([
              await queryToken(
                {
                  chainId: network.id,
                  id: underlyingTokenAddress,
                },
                true
              ).unwrap(),
              await queryUnderlyingBalance({
                accountAddress,
                tokenAddress: underlyingTokenAddress,
                chainId: network.id,
              }).unwrap(),
            ]);

            if (!underlyingToken) {
              handleHigherOrderValidationError({
                message: "Underlying token not found. This should never happen. Please refresh the page or contact support!",
              });
              return false;
            }

            const underlyingBalanceBigNumber = BigNumber.from(
              underlyingBalance.balance
            );
            const wrapAmountBigNumber = parseUnits(
              validForm.data.amountDecimal, underlyingToken.decimals
            );

            const isWrappingIntoNegative =
              underlyingBalanceBigNumber.lt(wrapAmountBigNumber);
            if (isWrappingIntoNegative) {
              handleHigherOrderValidationError({
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
                  handleHigherOrderValidationError({
                    message:
                      "You are wrapping out of native asset used for gas. You need to leave some gas tokens for the transaction to succeed.",
                  });
                }
              }
            }
          }

          if (type === RestorationType.Downgrade) {
            if (accountAddress) {
              const realtimeBalance = await queryRealtimeBalance(
                {
                  accountAddress,
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
                balanceTimestampMs: realtimeBalance.balanceTimestamp,
              });
              const balanceAfterWrappingBigNumber = currentBalanceBigNumber.sub(
                parseUnits(validForm.data.amountDecimal, 18)
              );

              const amountBigNumber = parseUnits(validForm.data.amountDecimal, 18);
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

                const minimumStreamTime = network.bufferTimeInMinutes * 60 * 2;
                const secondsToCritical = Math.floor(
                  (dateWhenBalanceCritical.getTime() - Date.now()) / 1000
                );

                if (secondsToCritical < minimumStreamTime) {
                  handleHigherOrderValidationError({
                    message: `You need to leave enough balance to stream for ${minimumStreamTime} seconds.`,
                  });
                }
              }
            }
          }
        }

        return true;
      }),
    [network, accountAddress]
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

  const { formState, setValue, trigger, clearErrors, setError, watch } =
    formMethods;

  const [hasRestored, setHasRestored] = useState(!restoration);
  useEffect(() => {
    if (restoration) {
      setValue("type", restoration.type, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValue(
        "data.amountDecimal",
        formatEther(restoration.amountWei),
        formRestorationOptions
      );
      setValue("data.tokenPair", restoration.tokenPair, formRestorationOptions);
      setHasRestored(true);
    }
  }, [restoration]);

  const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
    chainId: network.id,
  });

  useEffect(() => {
    if (isString(tokenQueryParam) && tokenPairsQuery.data) {
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
      router.replace({ query: tokenQueryParamRemoved });
    }
  }, [tokenQueryParam, tokenPairsQuery.data]);

  useEffect(() => {
    if (formState.isDirty) {
      stopAutoSwitchToAccountNetwork();
    }
  }, [formState.isDirty]);

  useEffect(() => {
    if (formState.isDirty) {
      trigger();
    }
  }, [accountAddress]);

  // useEffect(() => {
  //   console.log(formState);
  // }, [formState]);

  return hasRestored ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default WrappingFormProvider;
