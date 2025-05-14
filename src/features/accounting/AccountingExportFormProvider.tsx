import { yupResolver } from "@hookform/resolvers/yup";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { array, date, mixed, object, ObjectSchema } from "yup";
import { CurrencyCode } from "../../utils/currencyUtils";
import { testAddresses } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { UnitOfTime } from "../send/FlowRateInput";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { CommonFormEffects } from "../common/CommonFormEffects";

type Nullable<T> = { [K in keyof T]: T[K] | null };

export interface ValidAccountingExportForm {
  data: {
    addresses: Address[];
    counterparties: Address[];
    priceGranularity: UnitOfTime;
    virtualizationPeriod: UnitOfTime;
    currencyCode: CurrencyCode;
    startDate: Date;
    endDate: Date;
  };
}

const defaultFormValues: PartialAccountingExportForm = {
  data: {
    addresses: [],
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
  const { visibleAddress } = useVisibleAddress();
  const { network } = useExpectedNetwork();

  const formSchema = useMemo(
    () =>
      object().test(async (values) => {
        const primaryValidation: ObjectSchema<ValidAccountingExportForm> =
          object({
            data: object({
              addresses: array().min(1).required().test(testAddresses()),
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
    [network, visibleAddress]
  );

  const formMethods = useForm<PartialAccountingExportForm, undefined, ValidAccountingExportForm>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(formSchema) as any,
    mode: "onChange",
  });

  const { setValue, clearErrors } = formMethods;

  const [isInitialized, setIsInitialized] = useState(!initialFormValues);

  useEffect(() => {
    if (initialFormValues) {
      setValue("data", {
        addresses:
          initialFormValues.addresses ?? defaultFormValues.data.addresses,
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

  return isInitialized ? (
    <FormProvider {...formMethods}>
      {children}
      <CommonFormEffects />
    </FormProvider>
  ) : null;
};

export default AccountingExportFormProvider;
