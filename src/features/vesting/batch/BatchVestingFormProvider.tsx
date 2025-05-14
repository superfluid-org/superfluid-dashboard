import { ObjectSchema } from "yup";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { mixed, array, object, string, boolean, number, date } from "yup";
import { UnitOfTime } from "../../send/FlowRateInput";
import { testEtherAmount } from "../../../utils/yupUtils";
import { testAddress } from "../../../utils/yupUtils";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, useForm } from "react-hook-form";
import { CreateVestingFormEffects } from "../CreateVestingFormEffects";
import { vestingSupportedNetworks } from "../../network/networks";
import { rpcApi } from "../../redux/store";
import { createHandleHigherOrderValidationErrorFunc } from "../../../utils/createHandleHigherOrderValidationErrorFunc";
import { useExpectedNetwork } from "../../network/ExpectedNetworkContext";
import { MAX_VESTING_DURATION_IN_SECONDS, MAX_VESTING_DURATION_IN_YEARS } from "../../redux/endpoints/vestingSchedulerEndpoints";
import { add } from "date-fns";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import { convertPeriodToSeconds } from "./convertPeriod";
import { convertVestingScheduleFromAmountAndDurationsToAbsolutes } from "./VestingScheduleParams";
import { convertBatchFormToParams } from "./convertBatchFormToParams";
import { BigNumber } from "ethers";

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

  const { network } = useExpectedNetwork();
  const { visibleAddress: senderAddress } = useVisibleAddress();

  const { data: vestingSchedulerConstants } =
    rpcApi.useGetVestingSchedulerConstantsQuery({
      chainId: network.id,
      version: "v2"
    });

  const [getActiveVestingSchedule] =
    rpcApi.useLazyGetActiveVestingScheduleQuery();

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        clearErrors("data");

        const handleHigherOrderValidationError =
          createHandleHigherOrderValidationErrorFunc(
            setError,
            context.createError
          );

        const networkSupported = !!vestingSupportedNetworks.some(
          (supportedNetwork) => supportedNetwork.id === network.id
        );

        if (!networkSupported) {
          handleHigherOrderValidationError({
            message: `The feature is not available on this network.`,
          });
        }

        const validForm = (await primarySchema.validate(values, {
          context: {
            cliffEnabled: (values as PartialBatchVestingForm).data.cliffEnabled,
          },
        })) as ValidBatchVestingForm;
        const {
          data: {
            startDate,
            superTokenAddress,
            cliffPeriod,
            cliffEnabled,
            vestingPeriod,
            schedules
          },
        } = validForm;

        const cliffAndFlowDate = add(
          startDate,
          {
            seconds: convertPeriodToSeconds(cliffPeriod),
          },
        );

        const endDate = add(
          startDate,
          {
            seconds: convertPeriodToSeconds(vestingPeriod),
          },
        );

        if (!vestingSchedulerConstants) {
          throw new Error(
            "Haven't fetched VestingScheduler contract constants. This hopefully never happens. If it does, probably should refresh the application."
          );
        }
        const {
          MIN_VESTING_DURATION_IN_DAYS,
          MIN_VESTING_DURATION_IN_MINUTES,
          MIN_VESTING_DURATION_IN_SECONDS,
          END_DATE_VALID_BEFORE_IN_SECONDS,
          START_DATE_VALID_AFTER_IN_SECONDS,
        } = vestingSchedulerConstants;

        const durationFromCliffAndFlowDateToEndDate = Math.floor(
          (endDate.getTime() - cliffAndFlowDate.getTime()) / 1000
        );

        if (
          durationFromCliffAndFlowDateToEndDate <
          MIN_VESTING_DURATION_IN_SECONDS
        ) {
          handleHigherOrderValidationError({
            message: `The vesting end date has to be at least ${network.testnet
              ? `${MIN_VESTING_DURATION_IN_MINUTES} minutes`
              : `${MIN_VESTING_DURATION_IN_DAYS} days`
              } from the start or the cliff.`,
          });
        }

        const vestingDuration = convertPeriodToSeconds(vestingPeriod);

        if (vestingDuration > MAX_VESTING_DURATION_IN_SECONDS) {
          handleHigherOrderValidationError({
            message: `The vesting period has to be less than ${MAX_VESTING_DURATION_IN_YEARS} years.`,
          });
        }

        const secondsFromStartToEnd = Math.floor(
          (endDate.getTime() - cliffAndFlowDate.getTime()) / 1000
        );
        if (
          secondsFromStartToEnd <
          START_DATE_VALID_AFTER_IN_SECONDS + END_DATE_VALID_BEFORE_IN_SECONDS
        ) {
          handleHigherOrderValidationError({
            message: `Invalid vesting schedule time frame.`,
          });
        }

        if (schedules.length > 0) {
          const scheduleParams = convertBatchFormToParams(validForm, network.id);
          const absoluteScheduleParams = scheduleParams.map(convertVestingScheduleFromAmountAndDurationsToAbsolutes);

          const cliffAmount = absoluteScheduleParams.reduce((acc, x) => acc.add(x.cliffAmount), BigNumber.from(0));
          const totalAmount = scheduleParams.reduce((acc, x) => acc.add(x.totalAmount), BigNumber.from(0));

          if (cliffAmount.gte(totalAmount)) {
            handleHigherOrderValidationError({
              message: `Cliff amount has to be less than total amount.`,
            });
          }

          if (schedules.some(({ receiverAddress }) => receiverAddress.toLowerCase() === senderAddress?.toLowerCase())) {
            handleHigherOrderValidationError({
              message: `You can’t vest to yourself. Choose a different wallet.`,
            });
          }

          const receiverAddresses = schedules.map(({ receiverAddress }) => receiverAddress.toLowerCase());
          if ([...new Set(receiverAddresses)].length !== receiverAddresses.length) {
            handleHigherOrderValidationError({
              message: `There are duplicate receiver addresses.`,
            });
          }

          if (senderAddress) {
            await Promise.all(schedules.map(async ({ receiverAddress }) => {
              const { data: vestingSchedule } = await getActiveVestingSchedule({
                chainId: network.id,
                superTokenAddress,
                senderAddress,
                receiverAddress,
                version: "v2"
              });

              if (vestingSchedule) {
                handleHigherOrderValidationError({
                  message: `There already exists a vesting schedule between the accounts for the token. To create a new schedule, the active schedule needs to end or be deleted.`,
                });
              }
            }))
          }
        }

        return true;
      }),
    [
      network,
      getActiveVestingSchedule,
      senderAddress,
      vestingSchedulerConstants,
    ]
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
    resolver: yupResolver(formSchema) as any,
    mode: "onChange",
  });

  const { clearErrors, setError } = formMethods;

  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => setIsInitialized(true), []);

  return (
    <FormProvider {...formMethods}>
      {props.children(isInitialized)}
      <CreateVestingFormEffects />
    </FormProvider>
  );
}
