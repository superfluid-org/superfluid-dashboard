import { yupResolver } from "@hookform/resolvers/yup";
import {
  FC,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { mixed, number, object, ObjectSchema, string } from "yup";
import { testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { UnitOfTime } from "../send/FlowRateInput";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { formRestorationOptions } from "../transactionRestoration/transactionRestorations";

export type ValidFlowRateAllowanceEditForm = {
  data: {
    flowRateAllowance: {
      amountEther: string;
      unitOfTime: UnitOfTime;
    };
  };
};

const defaultFormValues = {
  data: {
    flowRateAllowance: {
      amountEther: "",
      unitOfTime: UnitOfTime.Second,
    },
  },
};

export type PartialEditStreamAllowanceForm = {
  data: {
    flowRateAllowance:
      | ValidFlowRateAllowanceEditForm["data"]["flowRateAllowance"]
      | typeof defaultFormValues.data.flowRateAllowance;
  };
};

export interface FlowRateAllowanceEditFormProviderProps {
  initialFormValues: Partial<ValidFlowRateAllowanceEditForm["data"]>;
}

const FlowRateAllowanceEditFormProvider: FC<
  PropsWithChildren<FlowRateAllowanceEditFormProviderProps>
> = ({ children, initialFormValues }) => {
  const { visibleAddress } = useVisibleAddress();

  const { network, stopAutoSwitchToWalletNetwork } = useExpectedNetwork();

  const formSchema = useMemo(
    () =>
      object({
        data: object().shape(
          {
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
          },
          []
        ),
      }),
    [network, visibleAddress]
  );

  const formMethods = useForm<PartialEditStreamAllowanceForm>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });
  const [isInitialized, setIsInitialized] = useState(!initialFormValues);

  const { formState, setValue, trigger, clearErrors } = formMethods;

  useEffect(() => {
    if (initialFormValues) {
      setValue(
        "data",
        {
          flowRateAllowance:
            initialFormValues.flowRateAllowance ??
            defaultFormValues.data.flowRateAllowance,
        },
        formRestorationOptions
      );
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (formState.isDirty) stopAutoSwitchToWalletNetwork();
  }, [formState.isDirty, stopAutoSwitchToWalletNetwork]);

  useEffect(() => {
    if (formState.isDirty) {
      trigger();
    }
  }, [visibleAddress]);

  return isInitialized ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default FlowRateAllowanceEditFormProvider;
