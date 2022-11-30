import { ErrorOption } from "react-hook-form";
import { CreateErrorOptions, ValidationError } from "yup";

export const createHandleHigherOrderValidationErrorFunc =
  (
    setError: (
      name: "data",
      error: ErrorOption,
      options?: {
        shouldFocus: boolean;
      }
    ) => void, // from `react-hook-form`
    createError: (params?: CreateErrorOptions) => ValidationError // from `yup`
  ) =>
  ({ message }: { message: string }) => {
    setError("data", {
      message: message,
    });
    throw createError({
      path: "data",
      message: message,
    });
  };
