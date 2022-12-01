import { ErrorOption } from "react-hook-form";
import { CreateErrorOptions, ValidationError } from "yup";
import { DependencyList, useCallback } from "react";

export type HandleHigherValidationErrorFunc = (arg: {
  message: string;
}) => ValidationError;

export const createHigherValidationErrorFunc =
  (
    setError: (
      name: "data",
      error: ErrorOption,
      options?: {
        shouldFocus: boolean;
      }
    ) => void, // from `react-hook-form`
    createError: (params?: CreateErrorOptions) => ValidationError // from `yup`
  ): HandleHigherValidationErrorFunc =>
  ({ message }: { message: string }) => {
    setError("data", {
      message: message,
    });
    return createError({
      path: "data",
      message: message,
    });
  };

export const useHigherValidation = <T>(
  callback: (
    sanitizedForm: T,
    handleError: HandleHigherValidationErrorFunc
  ) => Promise<boolean | ValidationError>,
  deps: DependencyList
) => useCallback(callback, deps);