import { memo, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@mui/material";
import { CreateVestingCardView } from "./CreateVestingSection";
import { transactionButtonDefaultProps } from "../transactionBoundary/TransactionButton";

export const PreviewButton = memo(function PreviewButton(props: {
    setView: (value: CreateVestingCardView) => void;
  }) {
    const { watch, formState: { isValid, isValidating } } = useFormContext();
  
    // A work-around for react-hook-form bug which causes the "cannot update a component while rendering another" error
    // https://github.com/orgs/react-hook-form/discussions/11760
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    useEffect(() => {
      setIsButtonDisabled(!isValid || isValidating);
    }, [isValid, isValidating]);
  
    return (
      <Button
        data-cy={"preview-schedule-button"}
        {...transactionButtonDefaultProps}
        disabled={isButtonDisabled}
        onClick={() => props.setView(CreateVestingCardView.Preview)}
      >
        Preview Vesting Schedule
      </Button>
    );
  });