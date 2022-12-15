import { yupResolver } from "@hookform/resolvers/yup";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { bool, date, mixed, number, object, ObjectSchema, string } from "yup";
import { dateNowSeconds } from "../../utils/dateUtils";
import { getMinimumStreamTimeInMinutes } from "../../utils/tokenUtils";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
import { formRestorationOptions } from "../transactionRestoration/transactionRestorations";
import { UnitOfTime } from "./FlowRateInput";
import useCalculateBufferInfo from "./useCalculateBufferInfo";

export type ValidStreamingForm = {
  data: {
    tokenAddress: string;
    receiverAddress: string;
    flowRate: {
      amountEther: string;
      unitOfTime: UnitOfTime;
    };
    understandLiquidationRisk: boolean;
    /**
     * In seconds.
     */
    endTimestamp: number | null;
  };
};

const defaultFormValues = {
  data: {
    flowRate: {
      amountEther: "",
      unitOfTime: UnitOfTime.Month,
    },
    receiverAddress: null,
    tokenAddress: null,
    understandLiquidationRisk: false,
    endTimestamp: null,
  },
};

export type PartialStreamingForm = {
  data: {
    tokenAddress: ValidStreamingForm["data"]["tokenAddress"] | null;
    receiverAddress: ValidStreamingForm["data"]["receiverAddress"] | null;
    flowRate:
      | ValidStreamingForm["data"]["flowRate"]
      | typeof defaultFormValues.data.flowRate;
    understandLiquidationRisk: boolean;
    endTimestamp: number | null;
  };
};

export interface StreamingFormProviderProps {
  initialFormValues: Partial<ValidStreamingForm["data"]>;
}

const StreamingFormProvider: FC<
  PropsWithChildren<StreamingFormProviderProps>
> = ({ children, initialFormValues }) => {
  const { address: accountAddress } = useAccount();
  const { network, stopAutoSwitchToWalletNetwork } = useExpectedNetwork();
  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryActiveFlow] = rpcApi.useLazyGetActiveFlowQuery();
  const calculateBufferInfo = useCalculateBufferInfo();
  const [tokenBufferTrigger] = rpcApi.useLazyTokenBufferQuery();

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        const primaryValidation: ObjectSchema<ValidStreamingForm> = object({
          data: object({
            tokenAddress: string().required().test(testAddress()),
            receiverAddress: string().required().test(testAddress()),
            flowRate: object({
              amountEther: string()
                .required()
                .test(testEtherAmount({ notNegative: true, notZero: true })),
              unitOfTime: mixed<UnitOfTime>()
                .required()
                .test(
                  (x) => Object.values(UnitOfTime).includes(x as UnitOfTime) // To check whether value is from an enum: https://github.com/microsoft/TypeScript/issues/33200#issuecomment-527670779
                ),
            }),
            understandLiquidationRisk: bool().required(),
            endTimestamp: number().default(null).nullable(),
          }),
        });

        clearErrors("data");
        await primaryValidation.validate(values);
        const validForm = values as ValidStreamingForm;

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

        const { tokenAddress, receiverAddress, understandLiquidationRisk } =
          validForm.data;

        if (
          accountAddress &&
          accountAddress.toLowerCase() === receiverAddress.toLowerCase()
        ) {
          handleHigherOrderValidationError({
            message: `You can't stream to yourself.`,
          });
        }

        if (accountAddress && tokenAddress && receiverAddress) {
          const [realtimeBalance, activeFlow] = await Promise.all([
            queryRealtimeBalance(
              {
                accountAddress,
                chainId: network.id,
                tokenAddress: tokenAddress,
              },
              true
            ).unwrap(),
            queryActiveFlow(
              {
                tokenAddress,
                receiverAddress,
                chainId: network.id,
                senderAddress: accountAddress,
              },
              true
            ).unwrap(),
          ]);

          const tokenBufferQuery = await tokenBufferTrigger({
            chainId: network.id,
            token: tokenAddress,
          });

          if (tokenBufferQuery.data) {
            const { newDateWhenBalanceCritical, balanceAfterBuffer } =
              calculateBufferInfo(
                network,
                realtimeBalance,
                activeFlow,
                {
                  amountWei: parseEther(
                    validForm.data.flowRate.amountEther
                  ).toString(),
                  unitOfTime: validForm.data.flowRate.unitOfTime,
                },
                tokenBufferQuery.data
              );

            if (balanceAfterBuffer.isNegative()) {
              handleHigherOrderValidationError({
                message: `You do not have enough balance for buffer.`,
              });
            }

            if (newDateWhenBalanceCritical) {
              const minimumStreamTimeInSeconds =
                getMinimumStreamTimeInMinutes(network.bufferTimeInMinutes) * 60;
              const secondsToCritical =
                newDateWhenBalanceCritical.getTime() / 1000 - dateNowSeconds();

              if (secondsToCritical <= minimumStreamTimeInSeconds) {
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

        if (!understandLiquidationRisk) {
          return false;
        }

        return true;
      }),
    [network, accountAddress, calculateBufferInfo]
  );

  const formMethods = useForm<PartialStreamingForm>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const { formState, setValue, trigger, clearErrors, setError, watch } =
    formMethods;

  const [receiverAddress, tokenAddress, flowRateEther] = watch([
    "data.receiverAddress",
    "data.tokenAddress",
    "data.flowRate",
  ]);

  useEffect(() => {
    setValue("data.understandLiquidationRisk", false);
  }, [receiverAddress, tokenAddress, flowRateEther, setValue]);

  const [isInitialized, setIsInitialized] = useState(!initialFormValues);

  useEffect(() => {
    if (initialFormValues) {
      setValue(
        "data",
        {
          flowRate:
            initialFormValues.flowRate ?? defaultFormValues.data.flowRate,
          receiverAddress:
            initialFormValues.receiverAddress ??
            defaultFormValues.data.receiverAddress,
          tokenAddress:
            initialFormValues.tokenAddress ??
            defaultFormValues.data.tokenAddress,
          understandLiquidationRisk:
            initialFormValues.understandLiquidationRisk ??
            defaultFormValues.data.understandLiquidationRisk,
          endTimestamp:
            initialFormValues.endTimestamp ??
            defaultFormValues.data.endTimestamp,
        },
        formRestorationOptions
      );
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (formState.isDirty) {
      stopAutoSwitchToWalletNetwork();
    }
  }, [formState.isDirty]);

  useEffect(() => {
    if (formState.isDirty) {
      trigger();
    }
  }, [accountAddress]);

  return isInitialized ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default StreamingFormProvider;
