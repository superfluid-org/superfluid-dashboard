import { yupResolver } from "@hookform/resolvers/yup";
import add from "date-fns/fp/add";
import { FC, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, Resolver, useForm } from "react-hook-form";
import { date, mixed, number, object, ObjectSchema, string } from "yup";
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
import { rpcApi } from "../redux/store";
import { UnitOfTime } from "../send/FlowRateInput";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import {
  createHigherValidationErrorFunc,
  useHigherValidation,
} from "../../utils/higherValidation";
import { debouncePromiseToLastResult } from "../../utils/debouncePromiseToLastResult";

export type SanitizedVestingForm = {
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
  const sanitizedSchema = useMemo<ObjectSchema<SanitizedVestingForm>>(
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

  const higherValidate = useHigherValidation<SanitizedVestingForm>(
    async (sanitizedForm, handleError) => {
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
      } = sanitizedForm;

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
        return handleError({
          message: `The vesting end date has to be at least ${MIN_VESTING_DURATION_DAYS} days from the start or the cliff.`,
        });
      }

      const vestingDuration =
        vestingPeriod.numerator * vestingPeriod.denominator;

      if (vestingDuration > MAX_VESTING_DURATION_SECONDS) {
        return handleError({
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
        return handleError({
          message: `Invalid vesting schedule time frame.`,
        });
      }

      const cliffAmount = parseEtherOrZero(cliffAmountEther);
      const totalAmount = parseEtherOrZero(totalAmountEther);

      if (cliffAmount.gte(totalAmount)) {
        return handleError({
          message: `Cliff amount has to be less than total amount.`,
        });
      }

      if (senderAddress) {
        if (senderAddress.toLowerCase() === receiverAddress.toLowerCase()) {
          return handleError({
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
          return handleError({
            message: `There already exists a vesting schedule between the accounts for the token. To create a new schedule, the active schedule needs to end or be deleted.`,
          });
        }
      }

      return true;
    },
    [network, getActiveVestingSchedule, senderAddress]
  );

  const formSchema = useMemo(
    () =>
      object().test(async (values, context) => {
        clearErrors("data");

        const handleHigherValidationError = createHigherValidationErrorFunc(
          setError,
          context.createError
        );

        if (network !== networkDefinition.goerli) {
          handleHigherValidationError({
            message: `The feature is only available on Goerli.`,
          });
        }

        const sanitizedForm = await sanitizedSchema.validate(values);

        return await higherValidate(sanitizedForm, handleHigherValidationError);
      }),
    [network, sanitizedSchema, higherValidate]
  );

  const resolver = useCallback<Resolver<PartialVestingForm>>(
    debouncePromiseToLastResult(yupResolver(formSchema), 200),
    [formSchema]
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
    resolver,
    mode: "onChange",
  });

  const {
    formState: { isDirty: isFormDirty },
    clearErrors,
    setError,
  } = formMethods;

  useEffect(() => {
    if (isFormDirty) {
      stopAutoSwitchToWalletNetwork();
    }
  }, [isFormDirty]);

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => setIsInitialized(true), []);

  return (
    <FormProvider {...formMethods}>{children(isInitialized)}</FormProvider>
  );
};

export default CreateVestingFormProvider;
