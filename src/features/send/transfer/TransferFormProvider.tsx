import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { object, ObjectSchema, string } from "yup";
import { testAddress, testEtherAmount } from "../../../utils/yupUtils";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { formRestorationOptions } from "../../transactionRestoration/transactionRestorations";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import { CommonFormEffects } from "../../common/CommonFormEffects";
import { rpcApi } from "../../redux/store";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";

export type ValidTransferForm = {
  data: {
    tokenAddress: string;
    receiverAddress: string;
    amountEther: string;
  };
};

const defaultFormValues = {
  data: {
    amountEther: "",
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

  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {

        clearErrors("data");
        await primarySchema.validate(values);
        const validForm = values as ValidTransferForm;

        // # Higher order validation
        const handleHigherOrderValidationError = ({
          message,
        }: {
          message: string;
        }) => {
          setError("data", {
            message: message,
          });
          throw context.createError({
            path: "data",
            message: message,
          });
        };

        const { tokenAddress, receiverAddress, amountEther } =
          validForm.data;

        if (!visibleAddress)
          return false;

        if (visibleAddress.toLowerCase() === receiverAddress.toLowerCase()) {
          handleHigherOrderValidationError({
            message: `You can't send to yourself.`,
          });
        }

        const { balance } = await queryRealtimeBalance(
          {
            accountAddress: visibleAddress,
            chainId: network.id,
            tokenAddress: tokenAddress,
          },
          true
        ).unwrap()

        const amountWei = parseEther(amountEther);
        const balanceWei = BigNumber.from(balance);

        if (amountWei.gt(balanceWei)) {
          // Note: nit-pick but we're not accounting for flowing here

          handleHigherOrderValidationError({
            message: `You don't have enough balance for the transfer.`,
          });
        }

        return true;
      }),
    [network, visibleAddress]
  );

  const formMethods = useForm<PartialTransferForm, undefined, ValidTransferForm>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(formSchema as ObjectSchema<PartialTransferForm>),
    mode: "onChange",
  });

  const { setValue, clearErrors, setError } =
    formMethods;

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
