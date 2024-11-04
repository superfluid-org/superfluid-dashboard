import { memo } from "react";
import { useFormContext } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { Alert } from "@mui/material";

export const ValidationSummary = memo(function ValidationSummary() {
    const { formState: { errors } } = useFormContext();
  
    return (
      <ErrorMessage
        name="data"
        errors={errors}
        render={({ message }) =>
          !!message && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {message}
            </Alert>
          )
        }
      />
    );
  });