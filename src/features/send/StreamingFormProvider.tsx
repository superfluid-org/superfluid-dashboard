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
  form: {
    token: SendStreamRestoration["token"] | null;
    receiver: SendStreamRestoration["receiver"] | null;
    flowRate: SendStreamRestoration["flowRate"];
    understandLiquidationRisk: boolean;
  };
};

const StreamingFormProvider: FC<{
  restoration: SendStreamRestoration | ModifyStreamRestoration | undefined;
}> = ({ restoration, children }) => {
  const { data: account } = useAccount();
  const { activeChain } = useNetwork();
  const { network } = useExpectedNetwork();

  const yupSchema: ObjectSchema<StreamingForm> = useMemo(
    () =>
      object({
        form: object({
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
      }),
    [account, activeChain] // TODO(KK): Are these necessary?
  );

  const defaultValues: StreamingForm = {
    form: {
      token: restoration?.token ?? null,
      receiver: restoration?.receiver ?? null,
      flowRate: restoration?.flowRate ?? {
        amountWei: "0",
        unitOfTime: UnitOfTime.Day,
      },
      understandLiquidationRisk: false,
    },
  };

  const formMethods = useForm({
    defaultValues,
    resolver: yupResolver(yupSchema),
    mode: "onChange",
  });

  // const {
  //   watch,
  //   formState: { errors },
  //   trigger,
  // } = formMethods;
  // useEffect(() => {
  //   const subscription = watch((value, { name, type }) =>
  //     console.log(value, name, type)
  //   );
  //   return () => subscription.unsubscribe();
  // }, [watch]);

  // useEffect(() => {
  //   console.log({
  //     errors,
  //   });
  // }, [errors]);

  return <FormProvider {...formMethods}>{children}</FormProvider>;
};

export default StreamingFormProvider;

//   const [tokenAddress, flowRate] = watch(["tokenAddress", "flowRate"]);
//   (activeChain && account) ? {
//     chainId: activeChain.id,
//     accountAddress: account.address,
//     tokenAddress:
// }
//   const [triggerRealtimeBalanceQuery] = rpcApi.useLazyRealtimeBalanceQuery(); // Use cache result?

// interface StreamingForm {
//   receiverAddress: string;
//   tokenAddress: string;
//   flowRate: {
//     amountEther: number | null;
//     secondsDivisor: number;
//   };
// }

// const yupSchema: ObjectSchema<StreamingForm> = useMemo(
//     () =>
//       object({
//         receiverAddress: string()
//           .trim()
//           .required()
//           .test("is-address", "Not an address.", (value) =>
//             isAddress(value ?? "")
//           ) // TODO(KK): use addMethod
//           .test(
//             "no-self-flow",
//             "You can't stream to yourself.",
//             (x) => x.toLowerCase() !== account?.address?.toLowerCase()
//           ),
//         tokenAddress: string()
//           .trim()
//           .required()
//           .test("is-address", "Not an address.", (value) =>
//             isAddress(value ?? "")
//           ), // TODO(KK): use addMethod
//         flowRate: object({
//           amountEther: number().positive().required(),
//           secondsDivisor: number().min(1).required(),
//         }),
//       })
//         .test(
//           "has-enough-for-buffer",
//           "You don't have enough for buffer.",
//           async (value: StreamingForm, _testContext) => {
//             console.log("has-enough-for-buffer");
//             return true;
//           }
//         )
//         .test(
//           "has-enough-to-sustain-stream-for-minimum-length-of-time",
//           "You don't have enough to stream for 4 hours.",
//           async (value: StreamingForm, _testContext) => {
//             console.log(
//               "has-enough-to-sustain-stream-for-minimum-length-of-time"
//             );
//             return true;
//           }
//         ),
//     [account, activeChain] // TODO(KK): Are these necessary?
//   );
