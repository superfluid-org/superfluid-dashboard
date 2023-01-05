import { yupResolver } from "@hookform/resolvers/yup";
import { parseEther } from "ethers/lib/utils";
import {
  memo,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FormProvider,
  Resolver,
  useForm,
} from "react-hook-form";
import { useAccount } from "wagmi";
import { bool, mixed, number, object, ObjectSchema, string } from "yup";
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
import { debouncePromiseToLastResult } from "../../utils/debouncePromiseToLastResult";

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

const StreamingFormProvider = memo(function StreamingFormProvider({
  children,
  initialFormValues,
}: PropsWithChildren<StreamingFormProviderProps>) {
  const { address: accountAddress } = useAccount();
  const { network, stopAutoSwitchToWalletNetwork } = useExpectedNetwork();
  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryActiveFlow] = rpcApi.useLazyGetActiveFlowQuery();
  const calculateBufferInfo = useCalculateBufferInfo();
  const [tokenBufferTrigger] = rpcApi.useLazyTokenBufferQuery();

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
    async (sanitizedForm, handleError) => {
      const { tokenAddress, receiverAddress, understandLiquidationRisk } =
        sanitizedForm.data;

      if (
        accountAddress &&
        accountAddress.toLowerCase() === receiverAddress.toLowerCase()
      ) {
        return handleError({
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

          if (tokenBufferQuery.data) {const { newDateWhenBalanceCritical, balanceAfterBuffer } =
          calculateBufferInfo(network, realtimeBalance, activeFlow,
            {amountWei: parseEther(
              sanitizedForm.data.flowRate.amountEther
            ).toString(),
            unitOfTime: sanitizedForm.data.flowRate.unitOfTime,
          },
                tokenBufferQuery.data
              );

        if (balanceAfterBuffer.isNegative()) {
          return handleError({
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
            return handleError({
              message: `You need to leave enough balance to stream for ${
                minimumStreamTimeInSeconds / 3600
              } hours.`,
            });
          }
        }
      }}

      if (!understandLiquidationRisk) {
        return false;
      }

      return true;
    },
    [
      network,
      accountAddress,
      calculateBufferInfo,
      queryActiveFlow,
      queryRealtimeBalance,
    ]
  );

  const finalSchema = useMemo(() => {
    return object().test(async (values, context) => {
      clearErrors("data");
      const sanitizedForm = await sanitizedSchema.validate(values);

      const handleHigherValidationError = createHigherValidationErrorFunc(
        setError,
        context.createError
      );

      return await higherValidate(sanitizedForm, handleHigherValidationError);
    });
  }, [sanitizedSchema, higherValidate]);

  const resolver = useCallback<Resolver<PartialStreamingForm>>(
    debouncePromiseToLastResult(yupResolver(finalSchema), 250),
    [finalSchema]
  );

  const formMethods = useForm<PartialStreamingForm>({
    defaultValues: defaultFormValues,
    resolver,
    mode: "onChange",
  });

  const {
    setValue,
    clearErrors,
    setError,
    trigger,
    formState: { isDirty: isFormDirty },
    watch,
  } = formMethods;

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
    if (isFormDirty) {
      stopAutoSwitchToWalletNetwork();
    }
  }, [isFormDirty]);

  useEffect(() => {
    if (isFormDirty) {
      trigger();
    }
  }, [accountAddress]);

  const [receiverAddress, tokenAddress, flowRateEther] = watch([
    "data.receiverAddress",
    "data.tokenAddress",
    "data.flowRate",
  ]);

  useEffect(() => {
    setValue("data.understandLiquidationRisk", false);
  }, [accountAddress, receiverAddress, tokenAddress, flowRateEther, setValue]);

  return isInitialized ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
});

export default StreamingFormProvider;
