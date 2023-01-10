import { yupResolver } from "@hookform/resolvers/yup";
import add from "date-fns/fp/add";
import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { date, mixed, number, object, ObjectSchema, string } from "yup";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { networkDefinition } from "../network/networks";
import {
  MAX_VESTING_DURATION_IN_SECONDS,
  MAX_VESTING_DURATION_IN_YEARS,
} from "../redux/endpoints/vestingSchedulerEndpoints";
import { rpcApi } from "../redux/store";
import { UnitOfTime } from "../send/FlowRateInput";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { createHandleHigherOrderValidationErrorFunc } from "../../utils/createHandleHigherOrderValidationErrorFunc";

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
    cliffAmountEther: string;
    cliffPeriod: {
      numerator: number;
      denominator: UnitOfTime;
    };
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
    cliffAmountEther: string | "";
    cliffPeriod: {
      numerator: number | "";
      denominator: UnitOfTime;
    };
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
          cliffAmountEther: string()
            .required()
            .test(testEtherAmount({ notNegative: true, notZero: true })),
          cliffPeriod: object({
            numerator: number()
              .positive()
              .max(Number.MAX_SAFE_INTEGER)
              .required(),
            denominator: mixed<UnitOfTime>()
              .required()
              .test((x) => Object.values(UnitOfTime).includes(x as UnitOfTime)),
          }).required(),
        }),
      }),
    []
  );

  const { network, stopAutoSwitchToWalletNetwork } = useExpectedNetwork();
  const [getActiveVestingSchedule] =
    rpcApi.useLazyGetActiveVestingScheduleQuery();
  const { visibleAddress: senderAddress } = useVisibleAddress();

  const { data: vestingSchedulerConstants } =
    rpcApi.useGetVestingSchedulerConstantsQuery({
      chainId: network.id,
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

        if (network !== networkDefinition.goerli) {
          handleHigherOrderValidationError({
            message: `The feature is only available on Goerli.`,
          });
        }

        const {
          data: {
            startDate,
            cliffAmountEther,
            totalAmountEther,
            cliffPeriod,
            vestingPeriod,
            receiverAddress,
            superTokenAddress,
          },
        } = (await primarySchema.validate(values)) as ValidVestingForm;

        const cliffAndFlowDate = add(
          {
            seconds: cliffPeriod.numerator * cliffPeriod.denominator,
          },
          startDate
        );

        const endDate = add(
          {
            seconds: vestingPeriod.numerator * vestingPeriod.denominator,
          },
          startDate
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
            message: `The vesting end date has to be at least ${
              network.testnet
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

        const cliffAmount = parseEtherOrZero(cliffAmountEther);
        const totalAmount = parseEtherOrZero(totalAmountEther);

        if (cliffAmount.gte(totalAmount)) {
          handleHigherOrderValidationError({
            message: `Cliff amount has to be less than total amount.`,
          });
        }

        if (senderAddress) {
          if (senderAddress.toLowerCase() === receiverAddress.toLowerCase()) {
            handleHigherOrderValidationError({
              message: `Can not vest to yourself.`,
            });
          }

          const { data: vestingSchedule } = await getActiveVestingSchedule({
            chainId: network.id,
            superTokenAddress,
            senderAddress,
            receiverAddress,
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
    ]
  );

  const formMethods = useForm<PartialVestingForm>({
    defaultValues: {
      data: {
        superTokenAddress: null,
        totalAmountEther: "",
        cliffAmountEther: "",
        cliffPeriod: {
          numerator: "",
          denominator: UnitOfTime.Year,
        },
        startDate: null,
        vestingPeriod: {
          numerator: "",
          denominator: UnitOfTime.Year,
        },
        receiverAddress: null,
      },
    },
    resolver: yupResolver(formSchema),
    mode: "onChange",
  });

  const { formState, setValue, trigger, clearErrors, setError, watch } =
    formMethods;

  useEffect(() => {
    if (formState.isDirty) {
      stopAutoSwitchToWalletNetwork();
    }
  }, [formState.isDirty]);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => setIsInitialized(true), []);

  return (
    <FormProvider {...formMethods}>{children(isInitialized)}</FormProvider>
  );
};

export default CreateVestingFormProvider;
