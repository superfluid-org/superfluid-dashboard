import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { object } from "yup";
import { Network } from "../../network/networks";
import { Token } from "@superfluid-finance/sdk-core";
import { formRestorationOptions } from "../../transactionRestoration/transactionRestorations";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";

export type ValidAddTokenWrapForm = {
  data: {
    network: Network | undefined;
    token: Token | undefined;
  };
};

export const defaultFormValues = {
  data: {
    network: undefined,
    token: undefined,
  },
};

export type PartialAddTokenWrapForm = {
  data: {
    network:
    | ValidAddTokenWrapForm["data"]["network"]
    | typeof defaultFormValues.data.network;
    token:
    | ValidAddTokenWrapForm["data"]["token"]
    | typeof defaultFormValues.data.token;
  };
};

export interface AddTokenWrapFormProviderProps {
  initialFormValues: Partial<ValidAddTokenWrapForm["data"]>;
}


const AddTokenWrapFormProvider: FC<
  PropsWithChildren<AddTokenWrapFormProviderProps>
> = ({ children, initialFormValues }) => {


  const { visibleAddress } = useVisibleAddress();
  const { network, stopAutoSwitchToWalletNetwork } = useExpectedNetwork();

  const formSchema = useMemo(
    () =>
      object({
        data: object().shape(
          {
            network: object().required(),
            token: object().required(),
          },
          []
        ),
      }),
    [network, visibleAddress]
  );

  const defaultValues = {
    data: {
      network: initialFormValues.network ?? defaultFormValues.data.network,
      token: initialFormValues.token ?? defaultFormValues.data.token,
    },
  };

  const formMethods = useForm<ValidAddTokenWrapForm>({
    defaultValues,
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const { formState, setValue, trigger } =  formMethods;

  const [isInitialized, setIsInitialized] = useState(!initialFormValues);

  useEffect(() => {
    if (initialFormValues) {
      setValue(
        "data",
        {
          network: initialFormValues.network ?? defaultFormValues.data.network,
          token: initialFormValues.token ?? defaultFormValues.data.token,
        },
        formRestorationOptions
      );
      setIsInitialized(true);
    }
  }, [initialFormValues]);

  useEffect(() => {
    if (formState.isDirty) {
      stopAutoSwitchToWalletNetwork();
    }
  }, [formState.isDirty]);

  useEffect(() => {
    if (formState.isDirty) {
      trigger();
    }
  }, [visibleAddress]);

  return isInitialized ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default AddTokenWrapFormProvider;