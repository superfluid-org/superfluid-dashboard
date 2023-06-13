import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ObjectSchema, mixed, number, object, string } from "yup";
import { UnitOfTime } from "../../send/FlowRateInput";
import { testAddress, testWeiAmount } from "../../../utils/yupUtils";
import { Network } from "../../network/networks";
import { TokenType } from "../../redux/endpoints/tokenTypes";
import { CommonFormEffects } from "../../common/CommonFormEffects";
import { BigNumber } from "ethers";

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
    network: Network;
    token: Token;
    operatorAddress: string;
    tokenAllowanceWei: BigNumber;
    flowRateAllowance: {
      amountWei: BigNumber;
      unitOfTime: UnitOfTime;
    };
    flowOperatorPermissions: number;
  };
};

export type PartialUpsertTokenAccessForm = {
  data: {
    network: ValidUpsertTokenAccessForm["data"]["network"] | null;
    token: ValidUpsertTokenAccessForm["data"]["token"] | null;
    operatorAddress: ValidUpsertTokenAccessForm["data"]["operatorAddress"];
    tokenAllowanceWei: ValidUpsertTokenAccessForm["data"]["tokenAllowanceWei"];
    flowRateAllowance: ValidUpsertTokenAccessForm["data"]["flowRateAllowance"];
    flowOperatorPermissions: ValidUpsertTokenAccessForm["data"]["flowOperatorPermissions"];
  };
};

export const defaultFormData: PartialUpsertTokenAccessForm["data"] = {
  network: null,
  token: null,
  operatorAddress: "",
  // Permission properties
  tokenAllowanceWei: BigNumber.from(0),
  flowRateAllowance: {
    amountWei: BigNumber.from(0),
    unitOfTime: UnitOfTime.Second,
  },
  flowOperatorPermissions: 0,
};

export interface UpsertTokenAccessFormProviderProps {
  initialFormData: Partial<ValidUpsertTokenAccessForm["data"]>;
}

const UpsertTokenAccessFormProvider: FC<
  PropsWithChildren<UpsertTokenAccessFormProviderProps>
> = ({ children, initialFormData }) => {
  const formSchema: ObjectSchema<ValidUpsertTokenAccessForm> = useMemo(
    () =>
      object({
        data: object({
          token: mixed<Token>().required(),
          operatorAddress: string().required().test(testAddress()),
          network: mixed<Network>().required(),
          tokenAllowanceWei: mixed<BigNumber>()
            .required()
            .test(testWeiAmount({ notNegative: true })),
          flowRateAllowance: object({
            amountWei: mixed<BigNumber>()
              .required()
              .test(testWeiAmount({ notNegative: true })),
            unitOfTime: mixed<UnitOfTime>()
              .required()
              .test((x) => Object.values(UnitOfTime).includes(x as UnitOfTime)),
          }),
          flowOperatorPermissions: number().required(),
        }),
      }),
    []
  );

  const defaultValues = {
    data: {
      ...defaultFormData,
      ...initialFormData,
    },
  };

  const formMethods = useForm<PartialUpsertTokenAccessForm>({
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
