import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { object, ObjectSchema, string } from "yup";
import { testAddress, testDecimalAmount } from "../../../utils/yupUtils";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { formRestorationOptions } from "../../transactionRestoration/transactionRestorations";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import { CommonFormEffects } from "../../common/CommonFormEffects";
import { rpcApi } from "../../redux/store";
import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { isSuper } from "../../redux/endpoints/tokenTypes";
import { useTransferTokens } from "./useTransferTokens";

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

const primaryDataSchema = object({
  tokenAddress: string().required().test(testAddress()),
  receiverAddress: string().required().test(testAddress()),
  amountEther: string().required().test(testDecimalAmount({ notNegative: true, notZero: true })),
});

const TransferFormProvider: FC<
  PropsWithChildren<TransferFormProviderProps>
> = ({ children, initialFormValues }) => {
  const { visibleAddress } = useVisibleAddress();
  const { network, stopAutoSwitchToWalletNetwork } = useExpectedNetwork();

  const [queryRealtimeBalance] = rpcApi.useLazyRealtimeBalanceQuery();
  const [queryUnderlyingBalance] = rpcApi.useLazyUnderlyingBalanceQuery();
  const { tokens } = useTransferTokens({ network, address: visibleAddress });

  const formSchema = useMemo(
    () =>
      object({
        data: primaryDataSchema.test(async (values, context) => {
          const validData = await primaryDataSchema.validate(values);

          // # Higher order validation
          const handleHigherOrderValidationError = ({
            message,
          }: {
            message: string;
          }): never => {
            throw context.createError({
              path: "data",
              message: message,
            });
          };

          const { tokenAddress, receiverAddress, amountEther } = validData;

          if (!visibleAddress)
            return false;

          if (visibleAddress.toLowerCase() === receiverAddress.toLowerCase()) {
            handleHigherOrderValidationError({
              message: `You can't send to yourself.`,
            });
          }

          const token = tokens.find(
            ({ address }) => address.toLowerCase() === tokenAddress.toLowerCase()
          );
          if (!token) {
            return handleHigherOrderValidationError({
              message: "Token details could not be loaded.",
            });
          }

          const amountWei: BigNumber = (() => {
            try {
              return parseUnits(amountEther, token.decimals);
            } catch {
              return handleHigherOrderValidationError({
                message: `This token supports up to ${token.decimals} decimal places.`,
              });
            }
          })();

          const { balance } = isSuper(token)
            ? await queryRealtimeBalance(
              {
                accountAddress: visibleAddress,
                chainId: network.id,
                tokenAddress,
              },
              true
            ).unwrap()
            : await queryUnderlyingBalance(
              {
                accountAddress: visibleAddress,
                chainId: network.id,
                tokenAddress,
              },
              true
            ).unwrap();
          const balanceWei = BigNumber.from(balance);

          if (amountWei.gt(balanceWei)) {
            // Note: nit-pick but we're not accounting for flowing here

            handleHigherOrderValidationError({
              message: `You don't have enough balance for the transfer.`,
            });
          }

          return true;
        }),
      }) as ObjectSchema<ValidTransferForm>,
    [network, queryRealtimeBalance, queryUnderlyingBalance, tokens, visibleAddress]
  );

  const formMethods = useForm<PartialTransferForm, undefined, ValidTransferForm>({
    defaultValues: defaultFormValues,
    resolver: yupResolver(formSchema) as any,
    mode: "onChange",
  });

  const { setValue } = formMethods;

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
