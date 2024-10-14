import { yupResolver } from "@hookform/resolvers/yup";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import {
  boolean,
  date,
  mixed,
  number,
  object,
  ObjectSchema,
  string,
} from "yup";
import { createHandleHigherOrderValidationErrorFunc } from "../../utils/createHandleHigherOrderValidationErrorFunc";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { vestingSupportedNetworks } from "../network/networks";
import {
  MAX_VESTING_DURATION_IN_SECONDS,
  MAX_VESTING_DURATION_IN_YEARS,
} from "../redux/endpoints/vestingSchedulerEndpoints";
import { rpcApi } from "../redux/store";
import { UnitOfTime } from "../send/FlowRateInput";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { CreateVestingFormEffects } from "./CreateVestingFormEffects";
import { add } from "date-fns";
import { useVestingVersion } from "../../hooks/useVestingVersion";

export type ValidVestingForm = {
  data: {
    superTokenAddress: string;
    receiverAddress: string;
    startDate: Date;
    totalAmountEther: string;
    vestingPeriod: {
      numerator: number;
      denominator: UnitOfTime;
    };
    cliffEnabled: boolean;
    cliffAmountEther?: string;
    cliffPeriod: {
      numerator?: number;
      denominator: UnitOfTime;
    };
    setupAutoWrap?: boolean;
    claimEnabled?: boolean;
  };
};

export type PartialVestingForm = {
  data: {
    superTokenAddress: string | null;
    receiverAddress: string | null;
    startDate: number | null;
    totalAmountEther: string | "";
    vestingPeriod: {
      numerator: number | "";
      denominator: UnitOfTime;
    };
    cliffEnabled: boolean;
    cliffAmountEther?: string;
    cliffPeriod: {
      numerator?: number | "";
      denominator: UnitOfTime;
    };
    setupAutoWrap: boolean;
    claimEnabled: boolean;
  };
};

const CreateVestingFormProvider: FC<{
  children: (isInitialized: boolean) => ReactNode;
}> = ({ children }) => {
  const primarySchema = useMemo<ObjectSchema<ValidVestingForm>>(
    () =>
      object({
        data: object({
          superTokenAddress: string().required().test(testAddress()),
          receiverAddress: string().required().test(testAddress()),
          startDate: date().required(),
          totalAmountEther: string()
            .required()
            .test(testEtherAmount({ notNegative: true, notZero: true })),
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
          cliffAmountEther: string().when("$cliffEnabled", {
            is: true,
            then: (schema) =>
              schema.required().test(
                testEtherAmount({
                  notNegative: true,
                  notZero: true,
                })
              ),
            otherwise: (schema) => schema,
          }),
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
          setupAutoWrap: boolean().optional(),
          claimEnabled: boolean().optional(),
        }),
      }),
    []
  );

  const { network } = useExpectedNetwork();
  const [getActiveVestingSchedule] =
    rpcApi.useLazyGetActiveVestingScheduleQuery();
  const { visibleAddress: senderAddress } = useVisibleAddress();

  const { vestingVersion: version } = useVestingVersion();

  const { data: vestingSchedulerConstants } =
    rpcApi.useGetVestingSchedulerConstantsQuery({
      chainId: network.id,
      version
    });

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

        const {
          data: {
            startDate,
            totalAmountEther,
            vestingPeriod,
            receiverAddress,
            superTokenAddress,
            cliffPeriod,
            cliffAmountEther,
            cliffEnabled,
          },
        } = (await primarySchema.validate(values, {
          context: {
            cliffEnabled: (values as PartialVestingForm).data.cliffEnabled,
          },
        })) as ValidVestingForm;

        const cliffAndFlowDate = add(
          startDate,
          {
            seconds: (cliffPeriod.numerator || 0) * cliffPeriod.denominator,
          },
        );

        const endDate = add(
          startDate,
          {
            seconds: vestingPeriod.numerator * vestingPeriod.denominator,
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

        const vestingDuration =
          vestingPeriod.numerator * vestingPeriod.denominator;

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

        const cliffAmount = parseEtherOrZero(cliffAmountEther || "0");
        const totalAmount = parseEtherOrZero(totalAmountEther);

        if (cliffAmount.gte(totalAmount)) {
          handleHigherOrderValidationError({
            message: `Cliff amount has to be less than total amount.`,
          });
        }

        if (senderAddress) {
          if (senderAddress.toLowerCase() === receiverAddress.toLowerCase()) {
            handleHigherOrderValidationError({
              message: `You can’t vest to yourself. Choose a different wallet.`,
            });
          }

          const { data: vestingSchedule } = await getActiveVestingSchedule({
            chainId: network.id,
            superTokenAddress,
            senderAddress,
            receiverAddress,
            version
          });

          if (vestingSchedule) {
            handleHigherOrderValidationError({
              message: `There already exists a vesting schedule between the accounts for the token. To create a new schedule, the active schedule needs to end or be deleted.`,
            });
          }
        }

        return true;
      }),
    [
      network,
      getActiveVestingSchedule,
      senderAddress,
      vestingSchedulerConstants,
      version
    ]
  );

  const formMethods = useForm<PartialVestingForm, undefined, ValidVestingForm>({
    defaultValues: {
      data: {
        superTokenAddress: null,
        receiverAddress: null,
        startDate: null,
        totalAmountEther: "",
        vestingPeriod: {
          numerator: "",
          denominator: UnitOfTime.Year,
        },
        cliffEnabled: false,
        cliffAmountEther: "",
        cliffPeriod: {
          numerator: "",
          denominator: UnitOfTime.Year,
        },
        setupAutoWrap: false,
        claimEnabled: false
      }
    },
    resolver: yupResolver(formSchema as ObjectSchema<PartialVestingForm>),
    mode: "onChange",
  });

  const { clearErrors, setError } = formMethods;

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => setIsInitialized(true), []);

  return (
    <FormProvider {...formMethods}>
      {/* <DevTool control={control as any} /> */}
      {children(isInitialized)}
      <CreateVestingFormEffects />
    </FormProvider>
  );
};

export default CreateVestingFormProvider;
