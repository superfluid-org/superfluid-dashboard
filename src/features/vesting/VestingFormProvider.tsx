import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { date, mixed, number, object, ObjectSchema, string } from "yup";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { UnitOfTime } from "../send/FlowRateInput";

type UnitOfAmount =
  | "wei"
  | "kwei"
  | "mwei"
  | "gwei"
  | "szabo"
  | "finney"
  | "ether";

export type ValidVestingForm = {
  data: {
    tokenAddress: string;
    receiverAddress: string;
    startDate: Date;
    totalAmountEther: string;
    vestingPeriod: {
      numerator: number;
      denominator: UnitOfTime;
    };
    cliffAmountEther: string;
    cliffPeriod: {
      numerator: number;
      denominator: UnitOfTime;
    };
  };
};

export type PartialVestingForm = {
  data: {
    tokenAddress: string | null;
    receiverAddress: string | null;
    startDate: number | null;
    totalAmountEther: string | null;
    vestingPeriod: {
      numerator: number | null;
      denominator: UnitOfTime;
    };
    cliffAmountEther: string | null;
    cliffPeriod: {
      numerator: number | null;
      denominator: UnitOfTime;
    };
  };
};

const VestingFormProvider: FC<PropsWithChildren> = ({ children }) => {
  const primarySchema = useMemo<ObjectSchema<ValidVestingForm>>(
    () =>
      object({
        data: object({
          tokenAddress: string().required().test(testAddress()),
          receiverAddress: string().required().test(testAddress()),
          startDate: date().required(),
          totalAmountEther: string()
            .required()
            .test(testEtherAmount({ notNegative: true, notZero: true })),
          vestingPeriod: object({
            numerator: number().required(),
            denominator: mixed<UnitOfTime>()
              .required()
              .test((x) => Object.values(UnitOfTime).includes(x as UnitOfTime)),
          }).required(),
          cliffAmountEther: string()
            .required()
            .test(testEtherAmount({ notNegative: true, notZero: true })),
          cliffPeriod: object({
            numerator: number().required(),
            denominator: mixed<UnitOfTime>()
              .required()
              .test((x) => Object.values(UnitOfTime).includes(x as UnitOfTime)),
          }).required(),
        }),
      }),
    []
  );

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        clearErrors("data");
        const validForm = (await primarySchema.validate(
          values
        )) as ValidVestingForm;
        return true;
      }),
    []
  );

  const formMethods = useForm<PartialVestingForm>({
    defaultValues: {
      data: {
        tokenAddress: null,
        totalAmountEther: null,
        cliffAmountEther: null,
        cliffPeriod: {
          numerator: null,
          denominator: UnitOfTime.Year,
        },
        startDate: null,
        vestingPeriod: {
          numerator: null,
          denominator: UnitOfTime.Year,
        },
        receiverAddress: null,
      },
    },
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const { formState, setValue, trigger, clearErrors, setError, watch } =
    formMethods;

  const { stopAutoSwitchToWalletNetwork } = useExpectedNetwork();
  useEffect(() => {
    if (formState.isDirty) {
      stopAutoSwitchToWalletNetwork();
    }
  }, [formState.isDirty]);

  const [isInitialized, setIsInitialized] = useState(true);

  return isInitialized ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default VestingFormProvider;

// findClosestUnitOfTime
// UnitOfAmount
