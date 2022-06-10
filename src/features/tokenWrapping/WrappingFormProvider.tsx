import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { number, object, ObjectSchema, string } from "yup";
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
import { formatEther, parseEther } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { BigNumber } from "ethers";
import { NATIVE_ASSET_ADDRESS } from "../redux/endpoints/tokenTypes";
import { calculateMaybeCriticalAtTimestamp } from "../../utils/tokenUtils";

export type WrappingForm = {
  type: RestorationType.Downgrade | RestorationType.Upgrade;
  data: {
    tokenUpgrade: SuperTokenUpgradeRestoration["tokenUpgrade"];
    amountEther: string;
  };
};

export type ValidWrappingForm = {
  data: {
    tokenUpgrade: WrappingForm["data"]["tokenUpgrade"];
    amountEther: WrappingForm["data"]["amountEther"];
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
  const { data: account } = useAccount();

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        const { type } = values as WrappingForm;

        const primarySchema: ObjectSchema<ValidWrappingForm> = object({
          data: object({
            tokenUpgrade: object({
              superToken: object({
                type: number().required(),
                address: string().required(),
                name: string().required(),
                symbol: string().required(),
              }).required(),
              underlyingToken: object({
                type: number().required(),
                address: string().required(),
                name: string().required(),
                symbol: string().required(),
              }).required(),
            }).required(),
            amountEther: string()
              .required()
              .matches(
                /^[0-9]*[.,]?[0-9]*$/,
                "Amount has to be a positive number."
              )
              .test("not-zero", "Enter an amount.", (x) => {
                try {
                  return !parseEther(x).isZero();
                } catch (error) {
                  return false;
                }
              }),
          }),
        });

        await primarySchema.validate(values);
        const validForm = values as ValidWrappingForm;

        // # Higher order validation
        const accountAddress = account?.address;

        if (accountAddress) {
          if (type === RestorationType.Upgrade) {
            const tokenAddress =
              validForm.data.tokenUpgrade.underlyingToken.address;
            const underlyingBalance = await queryUnderlyingBalance({
              accountAddress,
              tokenAddress,
              chainId: network.id,
            }).unwrap();

            const underlyingBalanceBigNumber = BigNumber.from(
              underlyingBalance.balance
            );
            const wrapAmountBigNumber = parseEther(validForm.data.amountEther);

            const isWrappingIntoNegative =
              underlyingBalanceBigNumber.lt(wrapAmountBigNumber);
            if (isWrappingIntoNegative) {
              throw context.createError({
                path: "data.amountEther.hov",
                message: "You do not have enough balance.",
              });
            }

            const isNativeAsset = tokenAddress === NATIVE_ASSET_ADDRESS;
            if (isNativeAsset) {
              const isWrappingIntoZero = BigNumber.from(
                underlyingBalanceBigNumber
              ).eq(wrapAmountBigNumber);
              if (isWrappingIntoZero) {
                throw context.createError({
                  path: "data.amountEther.hov",
                  message:
                    "You are wrapping out of native asset used for gas. You need to leave some gas tokens for the transaction to succeed.",
                });
              }
            }
          }

          if (type === RestorationType.Downgrade) {
            if (accountAddress) {
              const realtimeBalance = await queryRealtimeBalance(
                {
                  accountAddress,
                  chainId: network.id,
                  tokenAddress: validForm.data.tokenUpgrade.superToken.address,
                },
                true
              ).unwrap();

              const flowRateBigNumber = BigNumber.from(
                realtimeBalance.flowRate
              );
              const currentBalanceBigNumber = BigNumber.from(
                realtimeBalance.balance
              ).add(
                BigNumber.from(new Date().getTime())
                  .sub(realtimeBalance.balanceTimestamp * 1000)
                  .mul(flowRateBigNumber)
                  .div(1000)
              );

              const amountBigNumber = parseEther(validForm.data.amountEther);
              const isWrappingIntoNegative =
                currentBalanceBigNumber.lt(amountBigNumber);
              if (isWrappingIntoNegative) {
                throw context.createError({
                  path: "data.amountEther.hov",
                  message: "You do not have enough balance.",
                });
              }

              if (flowRateBigNumber.isNegative()) {
                const dateWhenBalanceCritical = new Date(
                  calculateMaybeCriticalAtTimestamp({
                    balanceUntilUpdatedAtWei: currentBalanceBigNumber,
                    updatedAtTimestamp: realtimeBalance.balanceTimestamp,
                    totalNetFlowRateWei: flowRateBigNumber,
                  })
                    .mul(1000)
                    .toNumber()
                );

                const minimumStreamTime = network.bufferTimeInMinutes * 60 * 2;
                const secondsToCritical = Math.round(
                  (dateWhenBalanceCritical.getTime() - Date.now()) / 1000
                );

                if (secondsToCritical < minimumStreamTime) {
                  throw context.createError({
                    path: "data.amountEther.hov",
                    message: `You need to leave enough balance to stream for ${minimumStreamTime} seconds.`,
                  });
                }
              }
            }
          }
        }

        return true;
      }),
    [network, account]
  );

  const formMethods = useForm<WrappingForm>({
    defaultValues: {
      data: {
        tokenUpgrade: getNetworkDefaultTokenPair(network),
        amountEther: "",
      },
    },
    mode: "onChange",
    resolver: yupResolver(formSchema),
  });

  const { formState, setValue, trigger } = formMethods;

  const [hasRestored, setHasRestored] = useState(!restoration);
  useEffect(() => {
    if (restoration) {
      setValue("type", restoration.type, {
        shouldDirty: false,
        shouldTouch: false,
        shouldValidate: false,
      });
      setValue(
        "data.amountEther",
        formatEther(restoration.amountWei),
        formRestorationOptions
      );
      setValue(
        "data.tokenUpgrade",
        restoration.tokenUpgrade,
        formRestorationOptions
      );
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
        setValue("data.tokenUpgrade", tokenPair, formRestorationOptions);
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
  }, [account]);

  return hasRestored ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default WrappingFormProvider;
