import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { mixed, number, object, string } from "yup";
import { UnitOfTime } from "../../send/FlowRateInput";
import { testAddress, testEtherAmount } from "../../../utils/yupUtils";
import { formRestorationOptions } from "../../transactionRestoration/transactionRestorations";
import { Network } from "../../network/networks";
import { TokenType } from "../../redux/endpoints/tokenTypes";
import { BigNumber } from "ethers";
import { CommonFormEffects } from "../../common/CommonFormEffects";

export interface Token {
  type: TokenType;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  isListed: boolean;
}

export type ValidUpsertTokenAccessForm = {
  data: {
    network: Network | undefined;
    token: Token | undefined;
    operatorAddress: string;
    tokenAllowance: BigNumber;
    flowRateAllowance: {
      amountEther: BigNumber;
      unitOfTime: UnitOfTime;
    };
    flowPermissions: number;
  };
};

export const defaultFormValues = {
  data: {
    network: undefined,
    token: undefined,
    operatorAddress: "",
    // Permission properties
    tokenAllowance: BigNumber.from(0),
    flowRateAllowance: {
      amountEther: BigNumber.from(0),
      unitOfTime: UnitOfTime.Second,
    },
    flowPermissions: 0,
  },
};

export type PartialUpsertTokenAccessForm = {
  data: {
    network:
      | ValidUpsertTokenAccessForm["data"]["network"]
      | typeof defaultFormValues.data.network;
    token:
      | ValidUpsertTokenAccessForm["data"]["token"]
      | typeof defaultFormValues.data.token;
    operatorAddress:
      | ValidUpsertTokenAccessForm["data"]["operatorAddress"]
      | typeof defaultFormValues.data.operatorAddress;
    tokenAllowance:
      | ValidUpsertTokenAccessForm["data"]["tokenAllowance"]
      | typeof defaultFormValues.data.tokenAllowance;
    flowRateAllowance:
      | ValidUpsertTokenAccessForm["data"]["flowRateAllowance"]
      | typeof defaultFormValues.data.flowRateAllowance;
    flowPermissions:
      | ValidUpsertTokenAccessForm["data"]["flowPermissions"]
      | typeof defaultFormValues.data.flowPermissions;
  };
};

export interface UpsertTokenAccessFormProviderProps {
  initialFormValues: Partial<ValidUpsertTokenAccessForm["data"]>;
}

const UpsertTokenAccessFormProvider: FC<
  PropsWithChildren<UpsertTokenAccessFormProviderProps>
> = ({ children, initialFormValues }) => {
  const formSchema = useMemo(
    () =>
      object({
        data: object().shape(
          {
            token: object().required(),
            operatorAddress: string().required().test(testAddress()),
            network: object().required(),
            tokenAllowance: string()
              .required()
              .test(testEtherAmount({ notNegative: true })),
            flowRateAllowance: object({
              amountEther: string()
                .required()
                .test(testEtherAmount({ notNegative: true, notZero: true })),
              unitOfTime: mixed<UnitOfTime>()
                .required()
                .test((x) =>
                  Object.values(UnitOfTime).includes(x as UnitOfTime)
                ),
            }),
            flowPermissions: number().required(),
          },
          []
        ),
      }),
    []
  );

  const defaultValues = {
    data: {
      tokenAllowance:
        initialFormValues.tokenAllowance ??
        defaultFormValues.data.tokenAllowance,
      flowRateAllowance:
        initialFormValues.flowRateAllowance ??
        defaultFormValues.data.flowRateAllowance,
      flowPermissions:
        initialFormValues.flowPermissions ??
        defaultFormValues.data.flowPermissions,
      network: initialFormValues.network ?? defaultFormValues.data.network,
      operatorAddress:
        initialFormValues.operatorAddress ??
        defaultFormValues.data.operatorAddress,
      token: initialFormValues.token ?? defaultFormValues.data.token,
    },
  };

  const formMethods = useForm<ValidUpsertTokenAccessForm>({
    defaultValues,
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  return (
    <FormProvider {...formMethods}>
      {children}
      <CommonFormEffects />
    </FormProvider>
  );
};

export default UpsertTokenAccessFormProvider;
