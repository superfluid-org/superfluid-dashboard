import { FC, useCallback, useEffect, useMemo, useState } from "react";
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
import { BigNumber } from "ethers";

export type ValidStreamingForm = {
  data: {
    token: SendStreamRestoration["token"];
    receiver: SendStreamRestoration["receiver"];
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
  }
};

const StreamingFormProvider: FC<{
  restoration: SendStreamRestoration | ModifyStreamRestoration | undefined;
}> = ({ restoration, children }) => {
  const { data: account } = useAccount();
  const { network, stopAutoSwitchToAccountNetwork } = useExpectedNetwork();

  const formSchema: ObjectSchema<ValidStreamingForm> = useMemo(
    () =>
      object({
        data: object({
          token: object({
            type: number().required(),
            address: string().required(),
            name: string().required(),
            symbol: string().required(),
          }).required(),
          receiver: object({
            hash: string().required(),
            name: string().optional(),
          })
            .required()
            .test("no-self-flow", "You can't stream to yourself.", (x) => {
              if (!x || !account) {
                return true;
              }
              return x.hash.toLowerCase() !== account.address?.toLowerCase();
            }),
          flowRate: object({
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
            unitOfTime: number().required(),
          }).default(defaultFlowRate),
          understandLiquidationRisk: bool().isTrue().required(),
        }),
      }),
    [account]
  );

  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryActiveFlow] = rpcApi.useLazyGetActiveFlowQuery();

  const calculateBufferInfo = useCalculateBufferInfo();

  const formMethods = useForm<PartialStreamingForm>({
    defaultValues: {
      data: {
        flowRate: defaultFlowRate,
        receiver: null,
        token: null,
        understandLiquidationRisk: false,
      }
    },
    resolver: async (values, context, options) => {
      const yupResult = await yupResolver(formSchema)(values, context, options);

      if (!Object.keys(yupResult.errors).length) {
        const validForm = values as ValidStreamingForm;
        await validateHigher(validForm);
      } else {
        clearErrors("data");
      }

      return yupResult;
    },
    mode: "onBlur",
  });

  const { formState, setError, getValues, setValue, clearErrors } = formMethods;

  const [hasRestored, setHasRestored] = useState(!restoration);
  useEffect(() => {
    if (restoration) {
      setValue(
        "data.flowRate",
        {
          amountEther: BigNumber.from(
            restoration.flowRate.amountWei
          ).toString(),
          unitOfTime: restoration.flowRate.unitOfTime,
        },
        formRestorationOptions
      );
      setValue("data.receiver", restoration.receiver, formRestorationOptions);
      setValue("data.token", restoration.token, formRestorationOptions);
      setHasRestored(true);
    }
  }, [restoration]);

  const validateHigher = useCallback(
    async (validForm: ValidStreamingForm) => {
      const accountAddress = account?.address;
      const tokenAddress = validForm.data.token?.address;
      const receiverAddress = validForm.data.receiver?.hash;

      if (accountAddress && tokenAddress && receiverAddress) {
        const realtimeBalance = await queryRealtimeBalance(
          {
            accountAddress,
            chainId: network.id,
            tokenAddress: tokenAddress,
          },
          true
        ).unwrap();

        const activeFlow = await queryActiveFlow(
          {
            tokenAddress,
            receiverAddress,
            chainId: network.id,
            senderAddress: accountAddress,
          },
          true
        ).unwrap();

        const { balanceAfterBuffer } = calculateBufferInfo(
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

        if (balanceAfterBuffer.isNegative()) {
          setError("data", {
            type: "validation",
            message: "Balance after buffer is negative.",
          });
        }
      }
    },
    [account]
  );

  // useEffect(() => {
  //   const validForm = getValues() as ValidStreamingForm;
  //   if (formState.isValid) {
  //     validateHigher(validForm);
  //   }
  // }, [formState.isValidating, validateHigher]);

  useEffect(() => {
    if (formState.isDirty) {
      stopAutoSwitchToAccountNetwork();
    }
  }, [formState.isDirty]);

  // useEffect(() => {
  //   console.log(formState);
  // }, [formState]);

  return hasRestored ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default StreamingFormProvider;
