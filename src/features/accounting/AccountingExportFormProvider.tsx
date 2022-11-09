import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useAccount } from "wagmi";
import { mixed, number, object, ObjectSchema, string } from "yup";
import { CurrencyCode } from "../../utils/currencyUtils";
import { testAddress } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { UnitOfTime } from "../send/FlowRateInput";
import { formRestorationOptions } from "../transactionRestoration/transactionRestorations";

type Nullable<T> = { [K in keyof T]: T[K] | null };

export interface ValidAccountingExportForm {
  data: {
    receiverAddress: string;
    priceGranularity: UnitOfTime;
    virtualizationPeriod: UnitOfTime;
    currencyCode: CurrencyCode;
    /**
     * startTimestamp and endTimestamp represented in Unix timestamp (seconds)
     */
    startTimestamp: number | null;
    endTimestamp: number | null;
  };
}

const defaultFormValues = {
  data: {
    receiverAddress: null,
    startTimestamp: null,
    endTimestamp: null,
    priceGranularity: UnitOfTime.Day,
    virtualizationPeriod: UnitOfTime.Month,
    currencyCode: CurrencyCode.USD,
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
              receiverAddress: string().required().test(testAddress()),
              startTimestamp: number().default(null).nullable(),
              endTimestamp: number().default(null).nullable(),
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

  const { formState, setValue, trigger, clearErrors, setError, watch } =
    formMethods;

  const [isInitialized, setIsInitialized] = useState(!initialFormValues);

  useEffect(() => {
    if (initialFormValues) {
      setValue(
        "data",
        {
          receiverAddress:
            initialFormValues.receiverAddress ??
            defaultFormValues.data.receiverAddress,
          startTimestamp:
            initialFormValues.startTimestamp ??
            defaultFormValues.data.startTimestamp,
          endTimestamp:
            initialFormValues.endTimestamp ??
            defaultFormValues.data.endTimestamp,
          priceGranularity:
            initialFormValues.priceGranularity ??
            defaultFormValues.data.priceGranularity,
          virtualizationPeriod:
            initialFormValues.virtualizationPeriod ??
            defaultFormValues.data.virtualizationPeriod,
          currencyCode:
            initialFormValues.currencyCode ??
            defaultFormValues.data.currencyCode,
        },
        formRestorationOptions
      );
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (formState.isDirty) {
      trigger();
    }
  }, [accountAddress]);

  return isInitialized ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default AccountingExportFormProvider;
