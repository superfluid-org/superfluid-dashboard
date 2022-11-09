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
import { useVestingToken } from "./useVestingToken";

export type VestingToken = Token & SuperTokenMinimal;

export enum CreateVestingCardView {
  Form = 0,
  Preview = 1,
  PreviewApproving = 2,
  Success = 3,
}

export const CreateVestingSection: FC<PropsWithChildren> = () => {
  const { watch } = useFormContext<PartialVestingForm>();
  const [superTokenAddress] = watch(["data.superTokenAddress"]);

  const { network } = useExpectedNetwork();
  const { token } = useVestingToken(network, superTokenAddress);

  const [view, setView] = useState<CreateVestingCardView>(
    CreateVestingCardView.Form
  );

  const router = useRouter();
  const BackButton = (
    <Box>
      <IconButton
        data-cy={"close-button"}
        color="inherit"
        onClick={() => {
          if (view === CreateVestingCardView.Form) {
            router.push("/vesting");
          } else {
            setView(view - 1);
          }
        }}
      >
        <ArrowBackIcon />
      </IconButton>
    </Box>
  );

  const StepperContainer = (
    <Stepper activeStep={view} sx={{ mt: 0, mb: 4 }}>
      <Step key={CreateVestingCardView.Form}>
        <StepLabel>Create</StepLabel>
      </Step>
      <Step key={CreateVestingCardView.Preview}>
        <StepLabel>Preview</StepLabel>
      </Step>
      <Step key={CreateVestingCardView.PreviewApproving}>
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
        sx={{ mb: 3 }}
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
      {(view === CreateVestingCardView.Preview ||
        view === CreateVestingCardView.PreviewApproving) &&
        token && <CreateVestingPreview token={token} setView={setView} />}
      {view === CreateVestingCardView.Success && token && <Box>Success!</Box>}
    </>
  );
};
