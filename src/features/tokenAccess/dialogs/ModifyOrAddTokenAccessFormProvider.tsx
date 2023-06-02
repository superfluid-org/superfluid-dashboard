

import { yupResolver } from "@hookform/resolvers/yup";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { mixed, number, object, string } from "yup";
import { UnitOfTime } from "../../send/FlowRateInput";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { testAddress, testEtherAmount } from "../../../utils/yupUtils";
import { formRestorationOptions } from "../../transactionRestoration/transactionRestorations";
import { Network } from "../../network/networks";
import { TokenType } from "../../redux/endpoints/tokenTypes";
import { BigNumber } from "ethers";

export interface Token {
    type: TokenType;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    isListed: boolean;
}

export type ValidModifyOrAddTokenAccessForm = {
    data: {
        network: Network | undefined;
        token: Token | undefined;
        operatorAddress: string;
        tokenAllowance: BigNumber;
        flowRateAllowance: {
            amountEther: BigNumber,
            unitOfTime: UnitOfTime,
        };
        flowPermissions: number,
    };
};

const defaultFormValues = {
    data: {
        network: undefined,
        token: undefined,
        operatorAddress: "",
        // Permission properties
        tokenAllowance: BigNumber.from(0),
        flowRateAllowance: {
            amountEther: BigNumber.from(0),
            unitOfTime: UnitOfTime.Second,
        },
        flowPermissions: 0,
    },
};

export type PartialModifyOrAddTokenAccessForm = {
    data: {
        network:
        | ValidModifyOrAddTokenAccessForm["data"]["network"]
        | typeof defaultFormValues.data.network;
        token:
        | ValidModifyOrAddTokenAccessForm["data"]["token"]
        | typeof defaultFormValues.data.token;
        operatorAddress:
        | ValidModifyOrAddTokenAccessForm["data"]["operatorAddress"]
        | typeof defaultFormValues.data.operatorAddress;
        tokenAllowance:
        | ValidModifyOrAddTokenAccessForm["data"]["tokenAllowance"]
        | typeof defaultFormValues.data.tokenAllowance;
        flowRateAllowance:
        | ValidModifyOrAddTokenAccessForm["data"]["flowRateAllowance"]
        | typeof defaultFormValues.data.flowRateAllowance;
        flowPermissions:
        | ValidModifyOrAddTokenAccessForm["data"]["flowPermissions"]
        | typeof defaultFormValues.data.flowPermissions;
    };
};

export interface ModifyOrAddTokenAccessFormProviderProps {
    initialFormValues: Partial<ValidModifyOrAddTokenAccessForm["data"]>;
}

const ModifyOrAddTokenAccessFormProvider: FC<
    PropsWithChildren<ModifyOrAddTokenAccessFormProviderProps>
> = ({ children, initialFormValues }) => {

    const { visibleAddress } = useVisibleAddress();
    const { network, stopAutoSwitchToWalletNetwork } = useExpectedNetwork();

    const formSchema = useMemo(
        () =>
            object({
                data: object().shape(
                    {
                        token: object().required(),
                        operatorAddress: string().required().test(testAddress()),
                        network: object().required(),
                    
                        tokenAllowance: string()
                            .required()
                            .test(testEtherAmount({ notNegative: true })),
                        flowRateAllowance: object({
                            amountEther: string()
                                .required()
                                .test(testEtherAmount({ notNegative: true, notZero: true })),
                            unitOfTime: mixed<UnitOfTime>()
                                .required()
                                .test((x) =>
                                    Object.values(UnitOfTime).includes(x as UnitOfTime)
                                ),
                        }),
                        flowPermissions: number().required().min(1).max(7),
                    },
                    []
                ),
            }),
        [network, visibleAddress]
    );

    const formMethods = useForm<ValidModifyOrAddTokenAccessForm>({
        defaultValues: defaultFormValues,
        resolver: yupResolver(formSchema),
        mode: "onChange",
    });
    const [isInitialized, setIsInitialized] = useState(!initialFormValues);

    const { formState, setValue, trigger } = formMethods;

    useEffect(() => {
        if (initialFormValues) {
            setValue(
                "data",
                {
                    tokenAllowance:
                        initialFormValues.tokenAllowance ??
                        defaultFormValues.data.tokenAllowance,
                    flowRateAllowance:
                        initialFormValues.flowRateAllowance ??
                        defaultFormValues.data.flowRateAllowance,
                    flowPermissions: initialFormValues.flowPermissions ?? defaultFormValues.data.flowPermissions,
                    network: initialFormValues.network ?? defaultFormValues.data.network,
                    operatorAddress: initialFormValues.operatorAddress ?? defaultFormValues.data.operatorAddress,
                    token: initialFormValues.token ?? defaultFormValues.data.token,
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

export default ModifyOrAddTokenAccessFormProvider;
