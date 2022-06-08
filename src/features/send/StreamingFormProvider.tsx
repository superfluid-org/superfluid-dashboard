import { FC, useCallback, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { bool, number, object, ObjectSchema, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { rpcApi } from "../redux/store";
import {
  ModifyStreamRestoration,
  SendStreamRestoration,
} from "../transactionRestoration/transactionRestorations";
import { UnitOfTime } from "./FlowRateInput";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import useCalculateBufferInfo from "./useCalculateBufferInfo";

export type StreamingForm = {
  root: {
    token: SendStreamRestoration["token"];
    receiver: SendStreamRestoration["receiver"];
    flowRate: SendStreamRestoration["flowRate"];
    understandLiquidationRisk: boolean;
  };
};

const StreamingFormProvider: FC<{
  restoration: SendStreamRestoration | ModifyStreamRestoration | undefined;
}> = ({ restoration, children }) => {
  const { data: account } = useAccount();
  const { network } = useExpectedNetwork();

  const primarySchema: ObjectSchema<StreamingForm> = useMemo(
    () =>
      object({
        root: object({
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
            amountWei: string().required(),
            unitOfTime: number().required(),
          }),
          understandLiquidationRisk: bool().isTrue().required()
        }),
      }),
    [account, network]
  );

  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryActiveFlow] = rpcApi.useLazyGetActiveFlowQuery();

  const calculateBufferInfo = useCalculateBufferInfo();

  const formMethods = useForm<StreamingForm>({
    defaultValues: {
      root: {
        receiver: null!,
        token: null!,
        flowRate: {
          amountWei: "0",
          unitOfTime: UnitOfTime.Second,
        },
        understandLiquidationRisk: false
      },
    },
    resolver: yupResolver(primarySchema),
    mode: "onChange",
  });

  const { setValue, formState, setError, getValues } = formMethods;

  if (restoration) {
    setValue("root.receiver", restoration.receiver);
    setValue("root.token", restoration.token);
    setValue("root.flowRate", restoration.flowRate);
  }

  const validateRoot = useCallback(
    async (validForm: StreamingForm) => {
      const accountAddress = account?.address;
      const tokenAddress = validForm.root.token?.address;
      const receiverAddress = validForm.root.receiver?.hash;

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
          validForm.root.flowRate
        );

        if (balanceAfterBuffer.isNegative()) {
          setError("root.flowRate", {
            type: "validation",
            message: "Balance after buffer is negative.",
          });
        }
      }
    },
    [account]
  );

  useEffect(() => {
    if (formState.isValid) {
      const validForm = getValues() as StreamingForm;
      validateRoot(validForm);
    }
  }, [formState.isValidating]);

  useEffect(() => {
    console.log(formState)
  }, [formState])

  return <FormProvider {...formMethods}>{children}</FormProvider>;
};

export default StreamingFormProvider;
