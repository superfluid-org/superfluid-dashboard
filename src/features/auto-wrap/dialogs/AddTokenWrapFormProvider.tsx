import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ObjectSchema, mixed, object } from "yup";
import { Network } from "../../network/networks";
import { Token } from "@superfluid-finance/sdk-core";
import { formRestorationOptions } from "../../transactionRestoration/transactionRestorations";
import { CommonFormEffects } from "../../common/CommonFormEffects";

export type ValidAddTokenWrapForm = {
  data: {
    network: Network;
    token: Token;
  };
};

export type PartialAddTokenWrapForm = {
  data: {
    network: ValidAddTokenWrapForm["data"]["network"] | null;
    token: ValidAddTokenWrapForm["data"]["token"] | null;
  };
};

export const defaultFormValues: PartialAddTokenWrapForm = {
  data: {
    network: null,
    token: null,
  },
};

export interface AddTokenWrapFormProviderProps {
  initialFormValues: Partial<ValidAddTokenWrapForm["data"]>;
}

const AddTokenWrapFormProvider: FC<
  PropsWithChildren<AddTokenWrapFormProviderProps>
> = ({ children, initialFormValues }) => {
  const formSchema: ObjectSchema<ValidAddTokenWrapForm> = useMemo(
    () =>
      object({
        data: object({
          network: mixed<Network>().required(),
          token: mixed<Token>().required(),
        }),
      }),
    []
  );

  const defaultValues = {
    data: {
      network: initialFormValues.network ?? defaultFormValues.data.network,
      token: initialFormValues.token ?? defaultFormValues.data.token,
    },
  };

  const formMethods = useForm<PartialAddTokenWrapForm>({
    defaultValues,
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const { setValue } = formMethods;

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

  return isInitialized ? (
    <FormProvider {...formMethods}>
      {children}
      <CommonFormEffects />
    </FormProvider>
  ) : null;
};

export default AddTokenWrapFormProvider;
