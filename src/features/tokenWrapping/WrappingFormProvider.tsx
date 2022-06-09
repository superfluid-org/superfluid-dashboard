import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { number, object, ObjectSchema, string } from "yup";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import {
  formRestorationOptions,
  SuperTokenDowngradeRestoration,
  SuperTokenUpgradeRestoration,
} from "../transactionRestoration/transactionRestorations";
import { getNetworkDefaultTokenPair } from "../network/networks";
import { isString } from "lodash";
import { subgraphApi } from "../redux/store";
import { formatEther, parseEther } from "ethers/lib/utils";
import { BigNumber } from "ethers";

export type WrappingForm = {
  data: {
    tokenUpgrade: SuperTokenUpgradeRestoration["tokenUpgrade"];
    amountEther: string;
  };
};

export type ValidWrappingForm = {
  data: {
    tokenUpgrade: WrappingForm["data"]["tokenUpgrade"];
    amountEther: WrappingForm["data"]["amountEther"];
  };
};

const WrappingFormProvider: FC<{
  restoration:
    | SuperTokenUpgradeRestoration
    | SuperTokenDowngradeRestoration
    | undefined;
}> = ({ restoration, children }) => {
  const { network, stopAutoSwitchToAccountNetwork } = useExpectedNetwork();
  const router = useRouter();
  const { token: tokenQueryParam } = router.query;

  const formSchema: ObjectSchema<ValidWrappingForm> = useMemo(
    () =>
      object({
        data: object({
          tokenUpgrade: object({
            superToken: object({
              type: number().required(),
              address: string().required(),
              name: string().required(),
              symbol: string().required(),
            }).required(),
            underlyingToken: object({
              type: number().required(),
              address: string().required(),
              name: string().required(),
              symbol: string().required(),
            }).required(),
          }).required(),
          amountEther: string()
            .required()
            .matches(
              /^[0-9]*[.,]?[0-9]*$/,
              "Amount has to be a positive number."
            )
            .test("not-zero", "Enter an amount.", (x) => {
              try {
                return !parseEther(x).isZero();
              } catch (error) {
                return false;
              }
            }),
        }),
      }),
    []
  );

  const formMethods = useForm<WrappingForm>({
    defaultValues: {
      data: {
        tokenUpgrade: getNetworkDefaultTokenPair(network),
        amountEther: "",
      },
    },
    mode: "onChange",
    resolver: yupResolver(formSchema),
  });

  const { formState, setValue } = formMethods;

  const [hasRestored, setHasRestored] = useState(!restoration);
  useEffect(() => {
    if (restoration) {
      setValue(
        "data.amountEther",
        formatEther(restoration.amountWei),
        formRestorationOptions
      );
      setValue(
        "data.tokenUpgrade",
        restoration.tokenUpgrade,
        formRestorationOptions
      );
      setHasRestored(true);
    }
  }, [restoration]);

  const tokenPairsQuery = subgraphApi.useTokenUpgradeDowngradePairsQuery({
    chainId: network.id,
  });

  useEffect(() => {
    if (isString(tokenQueryParam) && tokenPairsQuery.data) {
      const tokenPair = tokenPairsQuery.data.find(
        (x) =>
          x.superToken.address.toLowerCase() === tokenQueryParam.toLowerCase()
      );
      if (tokenPair) {
        setValue("data.tokenUpgrade", tokenPair, formRestorationOptions);
      }

      const { token, ...tokenQueryParamRemoved } = router.query;
      router.replace({ query: tokenQueryParamRemoved });
    }
  }, [tokenQueryParam, tokenPairsQuery.data]);

  useEffect(() => {
    if (formState.dirtyFields) {
      stopAutoSwitchToAccountNetwork();
    }
  }, [formState.isDirty]);

  return hasRestored ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default WrappingFormProvider;
