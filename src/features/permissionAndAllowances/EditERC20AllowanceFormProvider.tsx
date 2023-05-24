import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { object, string } from "yup";
import { testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { formRestorationOptions } from "../transactionRestoration/transactionRestorations";

export type ValidTokenAllowanceEditForm = {
  data: {
    tokenAllowance: string;
  };
};

const defaultFormValues = {
  data: {
    tokenAllowance: "",
  },
};

export type PartialEditERC20AllowanceAllowanceForm = {
  data: {
    tokenAllowance:
      | ValidTokenAllowanceEditForm["data"]["tokenAllowance"]
      | typeof defaultFormValues.data.tokenAllowance;
  };
};

export interface TokenAllowanceEditFormProviderProps {
  initialFormValues: Partial<ValidTokenAllowanceEditForm["data"]>;
}

const TokenAllowanceEditFormProvider: FC<
  PropsWithChildren<TokenAllowanceEditFormProviderProps>
> = ({ children, initialFormValues }) => {
  const { visibleAddress } = useVisibleAddress();

  const { network, stopAutoSwitchToWalletNetwork } = useExpectedNetwork();

  const formSchema = useMemo(
    () =>
      object({
        data: object().shape(
          {
            tokenAllowance: string()
              .required()
              .test(testEtherAmount({ notNegative: true })),
          },
          []
        ),
      }),
    [network, visibleAddress]
  );

  const formMethods = useForm<ValidTokenAllowanceEditForm>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });
  const [isInitialized, setIsInitialized] = useState(!initialFormValues);

  const { formState, setValue, trigger } =
    formMethods;

  useEffect(() => {
    if (initialFormValues) {
      setValue(
        "data",
        {
          tokenAllowance:
            initialFormValues.tokenAllowance ??
            defaultFormValues.data.tokenAllowance,
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

export default TokenAllowanceEditFormProvider;
