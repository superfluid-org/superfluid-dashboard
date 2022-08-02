import { FC, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { bool, mixed, number, object, ObjectSchema, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { rpcApi } from "../redux/store";
import {
  formRestorationOptions,
  ModifyStreamRestoration,
  SendStreamRestoration,
} from "../transactionRestoration/transactionRestorations";
import { UnitOfTime } from "./FlowRateInput";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import useCalculateBufferInfo from "./useCalculateBufferInfo";
import { parseEther } from "@superfluid-finance/sdk-redux/node_modules/@ethersproject/units";
import { formatEther } from "ethers/lib/utils";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";
import { BigNumber } from "ethers";
import { isNumber, xor } from "lodash";

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

const defaultFlowRate = {
  amountEther: "",
  unitOfTime: UnitOfTime.Month,
};

export type PartialStreamingForm = {
  data: {
    tokenAddress: ValidStreamingForm["data"]["tokenAddress"] | null;
    receiverAddress: ValidStreamingForm["data"]["receiverAddress"] | null;
    flowRate: ValidStreamingForm["data"]["flowRate"] | typeof defaultFlowRate;
    understandLiquidationRisk: boolean;
  };
};

const StreamingFormProvider: FC<{
  restoration: SendStreamRestoration | ModifyStreamRestoration | undefined;
}> = ({ restoration, children }) => {
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
            const minimumStreamTime = network.bufferTimeInMinutes * 60 * 2;

            const secondsToCritical = Math.round(
              (newDateWhenBalanceCritical.getTime() - Date.now()) / 1000
            );

            if (secondsToCritical < minimumStreamTime) {
              handleHigherOrderValidationError({
                message: `You need to leave enough balance to stream for ${minimumStreamTime} seconds.`,
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
    [network, accountAddress]
  );

  const formMethods = useForm<PartialStreamingForm>({
    defaultValues: {
      data: {
        flowRate: defaultFlowRate,
        receiverAddress: null,
        tokenAddress: null,
        understandLiquidationRisk: false,
      },
    },
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const { formState, setValue, trigger, clearErrors, setError } = formMethods;

  const [hasRestored, setHasRestored] = useState(!restoration);
  useEffect(() => {
    if (restoration) {
      setValue(
        "data.flowRate",
        {
          amountEther: formatEther(restoration.flowRate.amountWei),
          unitOfTime: restoration.flowRate.unitOfTime,
        },
        formRestorationOptions
      );
      setValue(
        "data.receiverAddress",
        restoration.receiverAddress,
        formRestorationOptions
      );
      setValue(
        "data.tokenAddress",
        restoration.tokenAddress,
        formRestorationOptions
      );
      setHasRestored(true);
    }
  }, [restoration]);

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

  return hasRestored ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default StreamingFormProvider;
