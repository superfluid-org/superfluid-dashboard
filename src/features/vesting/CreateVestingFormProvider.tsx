import { yupResolver } from "@hookform/resolvers/yup";
import { sub } from "date-fns/fp";
import add from "date-fns/fp/add";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { date, mixed, number, object, ObjectSchema, string } from "yup";
import { getTimeInSeconds } from "../../utils/dateUtils";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { networkDefinition } from "../network/networks";
import {
  END_DATE_VALID_BEFORE_SECONDS,
  MAX_VESTING_DURATION_SECONDS,
  MAX_VESTING_DURATION_YEARS,
  MIN_VESTING_DURATION_DAYS,
  MIN_VESTING_DURATION_SECONDS,
  START_DATE_VALID_AFTER_SECONDS,
} from "../redux/endpoints/vestingSchedulerEndpoints";
import { UnitOfTime } from "../send/FlowRateInput";

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

const CreateVestingFormProvider: FC<PropsWithChildren> = ({ children }) => {
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
  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        clearErrors("data");

        // TODO(KK): This is now duplicated 3 times. DRY, please
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

        const durationFromCliffAndFlowDateToEndDate = Math.floor(
          (endDate.getTime() - cliffAndFlowDate.getTime()) / 1000
        );
        if (
          durationFromCliffAndFlowDateToEndDate < MIN_VESTING_DURATION_SECONDS
        ) {
          handleHigherOrderValidationError({
            message: `The vesting end has to be at least ${MIN_VESTING_DURATION_DAYS} days from the start or the cliff.`,
          });
        }

        const vestingDuration =
          vestingPeriod.numerator * vestingPeriod.denominator;

        if (vestingDuration > MAX_VESTING_DURATION_SECONDS) {
          handleHigherOrderValidationError({
            message: `The vesting period has to be less than ${MAX_VESTING_DURATION_YEARS} years.`,
          });
        }

        const secondsFromStartToEnd = Math.floor(
          (endDate.getTime() - cliffAndFlowDate.getTime()) / 1000
        );
        if (
          secondsFromStartToEnd <
          START_DATE_VALID_AFTER_SECONDS + END_DATE_VALID_BEFORE_SECONDS
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

        return true;
      }),
    [network]
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

  return isInitialized ? (
    <FormProvider {...formMethods}>{children}</FormProvider>
  ) : null;
};

export default CreateVestingFormProvider;

// TODO(KK): throw-away below?

// findClosestUnitOfTime
// UnitOfAmount

type UnitOfAmount =
  | "wei"
  | "kwei"
  | "mwei"
  | "gwei"
  | "szabo"
  | "finney"
  | "ether";
