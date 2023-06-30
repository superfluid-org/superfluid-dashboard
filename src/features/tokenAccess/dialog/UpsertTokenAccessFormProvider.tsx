import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ObjectSchema, mixed, number, object, string } from "yup";
import { UnitOfTime } from "../../send/FlowRateInput";
import { testAddress, testWeiAmount } from "../../../utils/yupUtils";
import { Network } from "../../network/networks";
import { CommonFormEffects } from "../../common/CommonFormEffects";
import { BigNumber } from "ethers";
import { Token } from "@superfluid-finance/sdk-core";
import { SuperTokenMinimal } from "../../redux/endpoints/tokenTypes";

export type AccessToken = Token & SuperTokenMinimal;

export type ValidUpsertTokenAccessForm = {
  data: {
    network: Network;
    token: AccessToken;
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

const formSchema: ObjectSchema<ValidUpsertTokenAccessForm> = object({
  data: object({
    token: mixed<AccessToken>().required(),
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
}).test({
  name: "no-permissions",
  exclusive: true,
  message: "Use revoke when removing all permissions.",
  test: (x) =>
    x.data.flowRateAllowance.amountWei.gt(0) ||
    x.data.tokenAllowanceWei.gt(0) ||
    x.data.flowOperatorPermissions !== 0,
});
const UpsertTokenAccessFormProvider: FC<
  PropsWithChildren<UpsertTokenAccessFormProviderProps>
> = ({ children, initialFormData }) => {
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
      <CommonFormEffects autoSwitchToWalletNetworkWhenDirty />
    </FormProvider>
  );
};

export default UpsertTokenAccessFormProvider;
