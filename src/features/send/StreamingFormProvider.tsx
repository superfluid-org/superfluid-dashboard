import { isAddress } from "ethers/lib/utils";
import { FC, useCallback, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount, useNetwork } from "wagmi";
import {
  bool,
  number,
  object,
  ObjectSchema,
  string,
  ValidationError,
} from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { rpcApi } from "../redux/store";
import {
  ModifyStreamRestoration,
  SendStreamRestoration,
} from "../transactionRestoration/transactionRestorations";
import { UnitOfTime } from "./FlowRateInput";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { TurnedInTwoTone } from "@mui/icons-material";
import { useCalculateBufferInfo } from "./SendStreamPreview";

export type StreamingForm = {
  root: {
    token: SendStreamRestoration["token"] | null;
    receiver: SendStreamRestoration["receiver"] | null;
    flowRate: SendStreamRestoration["flowRate"];
    understandLiquidationRisk: boolean;
  };
};

export type StreamingFormFilled = {
  root: {
    token: SendStreamRestoration["token"];
    receiver: SendStreamRestoration["receiver"];
    flowRate: SendStreamRestoration["flowRate"];
    understandLiquidationRisk: true;
  };
};

const StreamingFormProvider: FC<{
  restoration: SendStreamRestoration | ModifyStreamRestoration | undefined;
}> = ({ restoration, children }) => {
  const { data: account } = useAccount();
  const { network } = useExpectedNetwork();

  const primarySchema: ObjectSchema<StreamingFormFilled> = useMemo(
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
          understandLiquidationRisk: bool().isTrue().required(),
          random: string(),
        }),
      }),
    [account, network]
  );

  const defaultValues: StreamingForm = {
    root: {
      token: restoration?.token ?? null,
      receiver: restoration?.receiver ?? null,
      flowRate: restoration?.flowRate ?? {
        amountWei: "0",
        unitOfTime: UnitOfTime.Day,
      },
      understandLiquidationRisk: false,
    },
  };

  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryActiveFlow] = rpcApi.useLazyGetActiveFlowQuery();

  const calculateBufferInfo = useCalculateBufferInfo();

  const formMethods = useForm({
    defaultValues,
    resolver: yupResolver(primarySchema),
    mode: "onChange",
  });

  const { formState, setError, getValues } = formMethods;

  const validateRoot = useCallback(
    async (validForm: StreamingFormFilled) => {
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
      const validForm = getValues() as StreamingFormFilled;
      validateRoot(validForm);
    }
  }, [formState.isValidating]);

  return <FormProvider {...formMethods}>{children}</FormProvider>;
};

export default StreamingFormProvider;
