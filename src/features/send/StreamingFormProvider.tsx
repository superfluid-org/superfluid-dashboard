import { yupResolver } from "@hookform/resolvers/yup";
import { BigNumber } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { debounce } from "lodash";
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import {
  bool,
  date,
  mixed,
  number,
  object,
  ObjectSchema,
  string,
  ValidationError,
} from "yup";
import {
  createHigherValidationErrorFunc,
  useHigherValidation,
} from "../../utils/higherValidation";
import { dateNowSeconds } from "../../utils/dateUtils";
import { getMinimumStreamTimeInMinutes } from "../../utils/tokenUtils";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { rpcApi } from "../redux/store";
import { formRestorationOptions } from "../transactionRestoration/transactionRestorations";
import { UnitOfTime } from "./FlowRateInput";
import useCalculateBufferInfo from "./useCalculateBufferInfo";

export type SanitizedStreamingForm = {
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
    tokenAddress: SanitizedStreamingForm["data"]["tokenAddress"] | null;
    receiverAddress: SanitizedStreamingForm["data"]["receiverAddress"] | null;
    flowRate:
      | SanitizedStreamingForm["data"]["flowRate"]
      | typeof defaultFormValues.data.flowRate;
    understandLiquidationRisk: boolean;
    endTimestamp: number | null;
  };
};

export interface StreamingFormProviderProps {
  initialFormValues: Partial<SanitizedStreamingForm["data"]>;
}

const StreamingFormProvider: FC<
  PropsWithChildren<StreamingFormProviderProps>
> = ({ children, initialFormValues }) => {
  const { address: accountAddress } = useAccount();
  const { network, stopAutoSwitchToWalletNetwork } = useExpectedNetwork();
  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryActiveFlow] = rpcApi.useLazyGetActiveFlowQuery();
  const calculateBufferInfo = useCalculateBufferInfo();

  const sanitizedSchema = useMemo<ObjectSchema<SanitizedStreamingForm>>(
    () =>
      object({
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
      }),
    []
  );

  const higherValidate = useHigherValidation<SanitizedStreamingForm>(
    async (sanitizedForm, handleHigherValidationError) => {
      const { tokenAddress, receiverAddress, understandLiquidationRisk } =
        sanitizedForm.data;

      if (
        accountAddress &&
        accountAddress.toLowerCase() === receiverAddress.toLowerCase()
      ) {
        return handleHigherValidationError({
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

        const { newDateWhenBalanceCritical, balanceAfterBuffer } =
          calculateBufferInfo(network, realtimeBalance, activeFlow, {
            amountWei: parseEther(
              sanitizedForm.data.flowRate.amountEther
            ).toString(),
            unitOfTime: sanitizedForm.data.flowRate.unitOfTime,
          });

        if (balanceAfterBuffer.isNegative()) {
          return handleHigherValidationError({
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
            return handleHigherValidationError({
              message: `You need to leave enough balance to stream for ${
                minimumStreamTimeInSeconds / 3600
              } hours.`,
            });
          }
        }
      }

      if (!understandLiquidationRisk) {
        return false;
      }

      return true;
    },
    [network, accountAddress, calculateBufferInfo]
  );

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        clearErrors("data");
        const sanitizedForm = await sanitizedSchema.validate(values);

        const handleHigherOrderValidationError =
          createHigherValidationErrorFunc(setError, context.createError);

        return await higherValidate(
          sanitizedForm,
          handleHigherOrderValidationError
        );
      }),
    [sanitizedSchema, higherValidate]
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
