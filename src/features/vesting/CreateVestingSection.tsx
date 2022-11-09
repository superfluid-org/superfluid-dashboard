import {
  Box,
  Card,
  Divider,
  IconButton,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Token } from "@superfluid-finance/sdk-core";
import { FC, PropsWithChildren, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { SuperTokenMinimal } from "../redux/endpoints/tokenTypes";
import { subgraphApi } from "../redux/store";
import CreateVestingFormProvider, {
  PartialVestingForm,
} from "./CreateVestingFormProvider";
import { CreateVestingPreview } from "./CreateVestingPreview";
import { CreateVestingForm } from "./CreateVestingForm";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { useRouter } from "next/router";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export type VestingToken = Token & SuperTokenMinimal;

export enum CreateVestingCardView {
  Form,
  Preview,
}

export const CreateVestingSection: FC<PropsWithChildren> = () => {
  const { watch } = useFormContext<PartialVestingForm>();
  const [superTokenAddress] = watch(["data.superTokenAddress"]);

  const { network } = useExpectedNetwork();
  const { token } = subgraphApi.useTokenQuery(
    superTokenAddress
      ? {
          chainId: network.id,
          id: superTokenAddress,
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        token: result.currentData
          ? ({
              ...result.currentData,
              address: result.currentData.id,
              type: getSuperTokenType({
                network,
                address: result.currentData.id,
                underlyingAddress: result.currentData.underlyingAddress,
              }),
            } as VestingToken)
          : undefined,
      }),
    }
  );

  const [view, setView] = useState<CreateVestingCardView>(
    CreateVestingCardView.Form
  );

  const router = useRouter();
  const BackButton = (
    <Box>
      <IconButton
        data-cy={"close-button"}
        color="inherit"
        onClick={() => router.push("/vesting")}
      >
        <ArrowBackIcon />
      </IconButton>
    </Box>
  );

  const getActiveStep = () => {
    switch (view) {
      case CreateVestingCardView.Form:
        return 0;
      case CreateVestingCardView.Preview:
        return 1;
    }
  };

  const StepperContainer = (
    <Stepper activeStep={getActiveStep()} alternativeLabel>
      <Step key="fill">
        <StepLabel>Form</StepLabel>
      </Step>
      <Step key="preview">
        <StepLabel>Preview</StepLabel>
      </Step>
      <Step key="approve">
        <StepLabel>Approve</StepLabel>
      </Step>
    </Stepper>
  );

  return (
    <>
      <Stack
        direction="row"
        justifyContent="start"
        alignItems="center"
        gap={2}
        sx={{ mb: 5 }}
      >
        {BackButton}
        <Typography component="h2" variant="h5">
          Create a Vesting Schedule
        </Typography>
      </Stack>

      {StepperContainer}

      {view === CreateVestingCardView.Form && (
        <CreateVestingForm token={token} setView={setView} />
      )}
      {view === CreateVestingCardView.Preview && token && (
        <CreateVestingPreview token={token} setView={setView} />
      )}
    </>
  );
};
