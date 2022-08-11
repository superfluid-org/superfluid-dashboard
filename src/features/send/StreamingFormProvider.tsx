import { yupResolver } from "@hookform/resolvers/yup";
import { parseEther } from "@superfluid-finance/sdk-redux/node_modules/@ethersproject/units";
import { BigNumber } from "ethers";
import { FC, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { bool, mixed, object, ObjectSchema, string } from "yup";
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
    understandLiquidationRisk: true;
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
  };
};

export interface StreamingFormProviderProps {
  initialFormValues: Partial<ValidStreamingForm["data"]>;
}

const StreamingFormProvider: FC<StreamingFormProviderProps> = ({
  children,
  initialFormValues,
}) => {
  const { address: accountAddress } = useAccount();
  const { network, stopAutoSwitchToAccountNetwork } = useExpectedNetwork();
  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryActiveFlow] = rpcApi.useLazyGetActiveFlowQuery();
  const calculateBufferInfo = useCalculateBufferInfo();

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
            understandLiquidationRisk: bool().required().isTrue(),
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

        const { tokenAddress, receiverAddress } = validForm.data;

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

          const { newDateWhenBalanceCritical, newFlowRate } =
            calculateBufferInfo(network, realtimeBalance, activeFlow, {
              amountWei: parseEther(
                validForm.data.flowRate.amountEther
              ).toString(),
              unitOfTime: validForm.data.flowRate.unitOfTime,
            });

          if (newDateWhenBalanceCritical) {
            const minimumStreamTimeInSeconds =
              getMinimumStreamTimeInMinutes(network.bufferTimeInMinutes) * 60;
            const secondsToCritical =
              newDateWhenBalanceCritical.getTime() / 1000 - dateNowSeconds();

            if (secondsToCritical < minimumStreamTimeInSeconds) {
              // NOTE: "secondsToCritical" might be off about 1 minute because of RTK-query cache for the balance query
              handleHigherOrderValidationError({
                message: `You need to leave enough balance to stream for ${
                  minimumStreamTimeInSeconds / 3600
                } hours.`,
              });
            }
          }

          if (
            activeFlow &&
            BigNumber.from(activeFlow.flowRateWei).eq(newFlowRate)
          ) {
            handleHigherOrderValidationError({
              message: `The stream already has the given flow rate.`,
            });
          }
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
        },
        formRestorationOptions
      );
      setIsInitialized(true);
    }
  }, []);

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

  return isInitialized ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default StreamingFormProvider;
