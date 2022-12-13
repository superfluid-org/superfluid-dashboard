import { yupResolver } from "@hookform/resolvers/yup";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { array, date, mixed, object, ObjectSchema } from "yup";
import { CurrencyCode } from "../../utils/currencyUtils";
import { testAddresses } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { UnitOfTime } from "../send/FlowRateInput";

type Nullable<T> = { [K in keyof T]: T[K] | null };

export interface ValidAccountingExportForm {
  data: {
    counterparties: Address[];
    priceGranularity: UnitOfTime;
    virtualizationPeriod: UnitOfTime;
    currencyCode: CurrencyCode;
    startDate: Date;
    endDate: Date;
  };
}

const defaultFormValues = {
  data: {
    counterparties: [],
    priceGranularity: UnitOfTime.Day,
    virtualizationPeriod: UnitOfTime.Month,
    currencyCode: CurrencyCode.USD,
    startDate: null,
    endDate: null,
  },
};

export interface PartialAccountingExportForm {
  data: Nullable<ValidAccountingExportForm["data"]>;
}

export interface StreamingFormProviderProps {
  initialFormValues: Partial<ValidAccountingExportForm["data"]>;
}

const AccountingExportFormProvider: FC<
  PropsWithChildren<StreamingFormProviderProps>
> = ({ children, initialFormValues }) => {
  const { address: accountAddress } = useAccount();
  const { network } = useExpectedNetwork();

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        const primaryValidation: ObjectSchema<ValidAccountingExportForm> =
          object({
            data: object({
              counterparties: array().required().test(testAddresses()),
              startDate: date().required(),
              endDate: date().required(),
              priceGranularity: mixed<UnitOfTime>()
                .required()
                .test((x) =>
                  Object.values(UnitOfTime).includes(x as UnitOfTime)
                ),
              virtualizationPeriod: mixed<UnitOfTime>()
                .required()
                .test((x) =>
                  Object.values(UnitOfTime).includes(x as UnitOfTime)
                ),
              currencyCode: mixed<CurrencyCode>()
                .required()
                .test((x) =>
                  Object.values(CurrencyCode).includes(x as CurrencyCode)
                ),
            }),
          });

        clearErrors("data");
        await primaryValidation.validate(values);
        return true;
      }),
    [network, accountAddress]
  );

  const formMethods = useForm<PartialAccountingExportForm>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const { formState, setValue, trigger, clearErrors } = formMethods;

  const [isInitialized, setIsInitialized] = useState(!initialFormValues);

  useEffect(() => {
    if (initialFormValues) {
      setValue("data", {
        counterparties:
          initialFormValues.counterparties ??
          defaultFormValues.data.counterparties,
        startDate:
          initialFormValues.startDate ?? defaultFormValues.data.startDate,
        endDate: initialFormValues.endDate ?? defaultFormValues.data.endDate,
        priceGranularity:
          initialFormValues.priceGranularity ??
          defaultFormValues.data.priceGranularity,
        virtualizationPeriod:
          initialFormValues.virtualizationPeriod ??
          defaultFormValues.data.virtualizationPeriod,
        currencyCode:
          initialFormValues.currencyCode ?? defaultFormValues.data.currencyCode,
      });
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (formState.isDirty) trigger();
  }, [accountAddress]);

  return isInitialized ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default AccountingExportFormProvider;
