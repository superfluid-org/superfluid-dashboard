import { isAddress } from "ethers/lib/utils";
import { FC, useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount, useNetwork } from "wagmi";
import { bool, number, object, ObjectSchema, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { rpcApi } from "../redux/store";
import {
  ModifyStreamRestoration,
  SendStreamRestoration,
} from "../transactionRestoration/transactionRestorations";
import { UnitOfTime } from "./FlowRateInput";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { TurnedInTwoTone } from "@mui/icons-material";

export type StreamingForm = {
  token: SendStreamRestoration["token"] | null;
  receiver: SendStreamRestoration["receiver"] | null;
  flowRate: SendStreamRestoration["flowRate"];
  understandLiquidationRisk: boolean;
};

const StreamingFormProvider: FC<{
  restoration: SendStreamRestoration | ModifyStreamRestoration | undefined;
}> = ({ restoration, children }) => {
  const { data: account } = useAccount();
  const { network } = useExpectedNetwork();

  const primarySchema: ObjectSchema<StreamingForm> = useMemo(
    () =>
      object({
        token: object({
          type: number().required(),
          address: string().required(),
          name: string().required(),
          symbol: string().required(),
        }).nullable(),
        receiver: object({
          hash: string().required(),
          name: string().optional(),
        })
          .nullable()
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
      }),
    [account, network]
  );

  const defaultValues: StreamingForm = {
    token: restoration?.token ?? null,
    receiver: restoration?.receiver ?? null,
    flowRate: restoration?.flowRate ?? {
      amountWei: "0",
      unitOfTime: UnitOfTime.Day,
    },
    understandLiquidationRisk: false,
  };

  const formMethods = useForm({
    defaultValues,
    resolver: yupResolver(primarySchema),
    mode: "onChange",
  });

  return <FormProvider {...formMethods}>{children}</FormProvider>;
};

export default StreamingFormProvider;