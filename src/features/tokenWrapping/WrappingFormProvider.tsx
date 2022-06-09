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
import { formatEther } from "ethers/lib/utils";

export type WrappingForm = {
  data: {
    tokenUpgrade: SuperTokenUpgradeRestoration["tokenUpgrade"];
    amountEthers: string;
  };
};

export type ValidWrappingForm = {
  data: {
    tokenUpgrade: WrappingForm["data"]["tokenUpgrade"];
    amountEthers: WrappingForm["data"]["amountEthers"];
  };
};

const WrappingFormProvider: FC<{
  restoration:
    | SuperTokenUpgradeRestoration
    | SuperTokenDowngradeRestoration
    | undefined;
}> = ({ restoration, children }) => {
  const { network } = useExpectedNetwork();
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
          amountEthers: string().required(),
        }),
      }),
    []
  );

  const formMethods = useForm<WrappingForm>({
    defaultValues: {
      data: {
        tokenUpgrade: getNetworkDefaultTokenPair(network),
        amountEthers: "",
      },
    },
    mode: "onChange",
    resolver: yupResolver(formSchema),
  });

  const { setValue } = formMethods;

  const [hasRestored, setHasRestored] = useState(!restoration);
  useEffect(() => {
    if (restoration) {
      setValue("data.amountEthers", formatEther(restoration.amountWei), formRestorationOptions);
      setValue("data.tokenUpgrade", restoration.tokenUpgrade, formRestorationOptions);
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

  return hasRestored ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default WrappingFormProvider;
