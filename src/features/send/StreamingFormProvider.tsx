import { FC, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { bool, number, object, ObjectSchema, string } from "yup";
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

export type ValidStreamingForm = {
  data: {
    token: SendStreamRestoration["token"];
    receiver: string;
    flowRate: {
      amountEther: string;
      unitOfTime: UnitOfTime;
    };
    understandLiquidationRisk: true;
  };
};

const defaultFlowRate = {
  amountEther: "",
  unitOfTime: UnitOfTime.Second,
};

export type PartialStreamingForm = {
  data: {
    token: ValidStreamingForm["data"]["token"] | null;
    receiver: ValidStreamingForm["data"]["receiver"] | null;
    flowRate: ValidStreamingForm["data"]["flowRate"] | typeof defaultFlowRate;
    understandLiquidationRisk: boolean;
  };
};

const StreamingFormProvider: FC<{
  restoration: SendStreamRestoration | ModifyStreamRestoration | undefined;
}> = ({ restoration, children }) => {
  const { data: account } = useAccount();
  const { network, stopAutoSwitchToAccountNetwork } = useExpectedNetwork();
  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryActiveFlow] = rpcApi.useLazyGetActiveFlowQuery();
  const calculateBufferInfo = useCalculateBufferInfo();

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        const primaryValidation: ObjectSchema<ValidStreamingForm> = object({
          data: object({
            token: object({
              type: number().required(),
              address: string().required().test(testAddress()),
              name: string().required(),
              symbol: string().required(),
            }).required(),
            receiver: string().required().test(testAddress()).required(),
            flowRate: object({
              amountEther: string()
                .required()
                .test(testEtherAmount({ notNegative: true, notZero: true })),
              unitOfTime: number().required(),
            }),
            understandLiquidationRisk: bool().isTrue().required(),
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

        const accountAddress = account?.address;
        const tokenAddress = validForm.data.token.address;
        const receiverAddress = validForm.data.receiver;

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

          const { newDateWhenBalanceCritical } = calculateBufferInfo(
            network,
            realtimeBalance,
            activeFlow,
            {
              amountWei: parseEther(
                validForm.data.flowRate.amountEther
              ).toString(),
              unitOfTime: validForm.data.flowRate.unitOfTime,
            }
          );

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
        }

        return true;
      }),
    [network, account]
  );

  const formMethods = useForm<PartialStreamingForm>({
    defaultValues: {
      data: {
        flowRate: defaultFlowRate,
        receiver: null,
        token: null,
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
      setValue("data.receiver", restoration.receiver, formRestorationOptions);
      setValue("data.token", restoration.token, formRestorationOptions);
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
  }, [account]);

  // useEffect(() => {
  //   console.log(formState);
  // }, [formState]);

  return hasRestored ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default StreamingFormProvider;
