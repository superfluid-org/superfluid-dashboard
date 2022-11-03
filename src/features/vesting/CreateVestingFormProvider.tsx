import { yupResolver } from "@hookform/resolvers/yup";
import add from "date-fns/fp/add";
import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { date, mixed, number, object, ObjectSchema, string } from "yup";
import { parseEtherOrZero } from "../../utils/tokenUtils";
import { testAddress, testEtherAmount } from "../../utils/yupUtils";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import {
  END_DATE_VALID_BEFORE_SECONDS,
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
    totalAmountEther: string | null;
    vestingPeriod: {
      numerator: number | null;
      denominator: UnitOfTime;
    };
    cliffAmountEther: string | null;
    cliffPeriod: {
      numerator: number | null;
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
            numerator: number().required(),
            denominator: mixed<UnitOfTime>()
              .required()
              .test((x) => Object.values(UnitOfTime).includes(x as UnitOfTime)),
          }).required(),
          cliffAmountEther: string()
            .required()
            .test(testEtherAmount({ notNegative: true, notZero: true })),
          cliffPeriod: object({
            numerator: number().required(),
            denominator: mixed<UnitOfTime>()
              .required()
              .test((x) => Object.values(UnitOfTime).includes(x as UnitOfTime)),
          }).required(),
        }),
      }),
    []
  );

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        clearErrors("data");
        const {
          data: {
            startDate,
            cliffAmountEther,
            totalAmountEther,
            cliffPeriod,
            vestingPeriod,
          },
        } = (await primarySchema.validate(values)) as ValidVestingForm;

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

        // cliff longer than total
        // start in history

        const vestingDuration =
          vestingPeriod.numerator * vestingPeriod.denominator;
        if (vestingDuration < MIN_VESTING_DURATION_SECONDS) {
          handleHigherOrderValidationError({
            message: `The vesting period has to be at least ${MIN_VESTING_DURATION_DAYS} days.`,
          });
        }

        const effectiveStartDate = add(
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

        const secondsFromStartToEnd = Math.floor(
          (endDate.getTime() - effectiveStartDate.getTime()) / 1000
        );
        if (
          secondsFromStartToEnd <
          START_DATE_VALID_AFTER_SECONDS + END_DATE_VALID_BEFORE_SECONDS
        ) {
          handleHigherOrderValidationError({
            message: `[elvi.js error]: Invalid vesting schedule.`,
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
    []
  );

  const formMethods = useForm<PartialVestingForm>({
    defaultValues: {
      data: {
        superTokenAddress: null,
        totalAmountEther: null,
        cliffAmountEther: null,
        cliffPeriod: {
          numerator: null,
          denominator: UnitOfTime.Year,
        },
        startDate: null,
        vestingPeriod: {
          numerator: null,
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

  const { stopAutoSwitchToWalletNetwork } = useExpectedNetwork();
  useEffect(() => {
    if (formState.isDirty) {
      stopAutoSwitchToWalletNetwork();
    }
  }, [formState.isDirty]);

  const [isInitialized, setIsInitialized] = useState(true);

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
