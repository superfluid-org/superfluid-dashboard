import { ObjectSchema } from "yup";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { mixed, array, object, string, boolean, number, date } from "yup";
import { UnitOfTime } from "../../send/FlowRateInput";
import { testEtherAmount } from "../../../utils/yupUtils";
import { testAddress } from "../../../utils/yupUtils";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { CreateVestingFormEffects } from "../CreateVestingFormEffects";

export type ValidBatchVestingForm = {
    data: {
        superTokenAddress: string;
        startDate: Date;
        vestingPeriod: {
            numerator: number;
            denominator: UnitOfTime;
        };
        cliffEnabled: boolean;
        cliffPeriod: {
            numerator?: number;
            denominator: UnitOfTime;
        };
        schedules: {
            receiverAddress: string;
            totalAmountEther: string;
        }[];
        claimEnabled?: boolean;
    };
}

export type PartialBatchVestingForm = {
    data: {
        superTokenAddress: string | null;
        startDate: Date | null;
        vestingPeriod: {
            numerator: number | "";
            denominator: UnitOfTime;
        };
        cliffEnabled: boolean;
        cliffPeriod: {
            numerator?: number | "";
            denominator: UnitOfTime;
        };
        schedules: {
            receiverAddress: string;
            totalAmountEther: string;
        }[];
        claimEnabled?: boolean;
    };
}

export function BatchVestingFormProvider(props: {
    children: (isInitialized: boolean) => ReactNode
}) {
    // TODO: Re-use parts of the schema
    const primarySchema = useMemo<ObjectSchema<ValidBatchVestingForm>>(
        () => object({
            data: object({
                superTokenAddress: string().required().test(testAddress()),
                startDate: date().required(),
                vestingPeriod: object({
                    numerator: number()
                        .positive()
                        .max(Number.MAX_SAFE_INTEGER)
                        .required(),
                    denominator: mixed<UnitOfTime>()
                        .required()
                        .test((x) => Object.values(UnitOfTime).includes(x as UnitOfTime)),
                }).required(),
                cliffEnabled: boolean().required(),
                cliffPeriod: object({
                    numerator: number()
                        .transform((value) => (isNaN(value) ? undefined : value))
                        .when("$cliffEnabled", {
                            is: true,
                            then: (schema) =>
                                schema.positive().max(Number.MAX_SAFE_INTEGER).required(),
                            otherwise: (schema) => schema.optional(),
                        }),
                    denominator: mixed<UnitOfTime>()
                        .required()
                        .test((x) => Object.values(UnitOfTime).includes(x as UnitOfTime)),
                }).required(),
                schedules: array().of(object({
                    receiverAddress: string().required().test(testAddress()),
                    totalAmountEther: string().required().test(testEtherAmount({
                        notNegative: true,
                        notZero: true,
                    })),
                })
                ).required(),
                setupAutoWrap: boolean().optional(),
                claimEnabled: boolean().optional(),
            })
        }),
        []
    );

    const formMethods = useForm<PartialBatchVestingForm, undefined, ValidBatchVestingForm>({
        defaultValues: {
            data: {
                superTokenAddress: null,
                startDate: null,
                vestingPeriod: {
                    numerator: "",
                    denominator: UnitOfTime.Year,
                },
                cliffEnabled: false,
                cliffPeriod: {
                    numerator: "",
                    denominator: UnitOfTime.Year,
                },
                schedules: [],
                claimEnabled: false
            }
        },
        resolver: yupResolver(primarySchema as ObjectSchema<PartialBatchVestingForm>),
        mode: "onChange",
    });

    const [isInitialized, setIsInitialized] = useState(false);
    useEffect(() => setIsInitialized(true), []);

    return (
        <FormProvider {...formMethods}>
            {props.children(isInitialized)}
            <CreateVestingFormEffects />
        </FormProvider>
    );
}
