import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { object, ObjectSchema, string } from "yup";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { formRestorationOptions } from "../transactionRestoration/transactionRestorations";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { CommonFormEffects } from "../common/CommonFormEffects";

export type ValidTransferForm = {
  data: {
    tokenAddress: string;
    receiverAddress: string;
    amountEther: string;
  };
};

const defaultFormValues = {
  data: {
    amountEther: "0",
    receiverAddress: null,
    tokenAddress: null
  },
};

export type PartialTransferForm = {
  data: {
    tokenAddress: ValidTransferForm["data"]["tokenAddress"] | null;
    receiverAddress: ValidTransferForm["data"]["receiverAddress"] | null;
    amountEther:
    | ValidTransferForm["data"]["amountEther"]
    | typeof defaultFormValues.data.amountEther;
  };
};

export interface TransferFormProviderProps {
  initialFormValues: Partial<ValidTransferForm["data"]>;
}

const primarySchema: ObjectSchema<ValidTransferForm> = object({
  data: object({
    tokenAddress: string().required().test(testAddress()),
    receiverAddress: string().required().test(testAddress()),
    amountEther: string().required().test(testEtherAmount({ notNegative: true, notZero: true })),
  })
})

const TransferFormProvider: FC<
  PropsWithChildren<TransferFormProviderProps>
> = ({ children, initialFormValues }) => {
  const { visibleAddress } = useVisibleAddress();
  const { network, stopAutoSwitchToWalletNetwork } = useExpectedNetwork();

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        clearErrors("data");

        await primarySchema.validate(values);
        const validForm = values as ValidTransferForm;

        // TODO(KK): Do I need higher order validation here?

        return true;
      }),
    []
  );

  const formMethods = useForm<PartialTransferForm, undefined, ValidTransferForm>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(formSchema as ObjectSchema<PartialTransferForm>),
    mode: "onChange",
  });

  const { formState, setValue, trigger, clearErrors, setError, watch } =
    formMethods;

  const [
    receiverAddress,
    tokenAddress,
    amountEther
  ] = watch([
    "data.receiverAddress",
    "data.tokenAddress",
    "data.amountEther"
  ]);

  const [isInitialized, setIsInitialized] = useState(!initialFormValues);

  useEffect(() => {
    if (initialFormValues) {
      setValue(
        "data",
        {
          amountEther:
            initialFormValues.amountEther ?? defaultFormValues.data.amountEther,
          receiverAddress:
            initialFormValues.receiverAddress ??
            defaultFormValues.data.receiverAddress,
          tokenAddress:
            initialFormValues.tokenAddress ??
            defaultFormValues.data.tokenAddress,
        },
        formRestorationOptions
      );
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

export default TransferFormProvider;
