import { useFormContext } from "react-hook-form";
import { rpcApi } from "../../redux/store";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import AutoWrapAllowanceTransactionButton from "./AutoWrapAllowanceTransactionButton";
import AutoWrapStrategyTransactionButton from "./AutoWrapStrategyTransactionButton";
import { CreateVestingTransactionButton } from "./CreateVestingTransactionButton";
import { ValidVestingForm } from "../CreateVestingFormProvider";
import { CreateVestingCardView, VestingToken } from "../CreateVestingSection";
import { Network } from "../../network/networks";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Stack, Step, StepLabel, Stepper } from "@mui/material";

export interface VestingTransactionSectionProps {
  network: Network;
  token: VestingToken;
  setView: (value: CreateVestingCardView) => void;
}

const autoWrapSteps = [
  { label: "Auto-Wrap" },
  { label: "Allowance" },
  { label: "Create" },
] as const;

export function VestingTransactionButtonSection({
  token,
  network,
  setView,
}: VestingTransactionSectionProps) {
  const { watch } = useFormContext<ValidVestingForm>();

  const [setupAutoWrap] = watch(["data.setupAutoWrap"]);

  const { visibleAddress } = useVisibleAddress();

  const {
    data: isAutoWrapAllowanceConfigured,
    isLoading: isAutoWrapAllowanceLoading,
  } = rpcApi.useIsAutoWrapAllowanceConfiguredQuery(
    setupAutoWrap && visibleAddress
      ? {
          chainId: network.id,
          accountAddress: visibleAddress,
          superTokenAddress: token.address,
          underlyingTokenAddress: token.underlyingAddress,
        }
      : skipToken
  );

  const isAutoWrapAllowanceOK = Boolean(
    !setupAutoWrap ||
      (!isAutoWrapAllowanceLoading && isAutoWrapAllowanceConfigured)
  );

  const {
    data: isAutoWrapStrategyConfigured,
    isLoading: isAutoWrapStrategyConfiguredLoading,
  } = rpcApi.useIsAutoWrapStrategyConfiguredQuery(
    setupAutoWrap && visibleAddress
      ? {
          chainId: network.id,
          accountAddress: visibleAddress,
          superTokenAddress: token.address,
          underlyingTokenAddress: token.underlyingAddress,
        }
      : skipToken
  );

  const isAutoWrapStrategyOK = Boolean(
    !setupAutoWrap ||
      (!isAutoWrapStrategyConfiguredLoading && isAutoWrapStrategyConfigured)
  );

  if (!setupAutoWrap) {
    return (
      <CreateVestingTransactionButton setView={setView} isVisible={true} />
    );
  } else {
    const activeStep = !isAutoWrapStrategyOK
      ? 0
      : !isAutoWrapAllowanceOK
      ? 1
      : 2;

    return (
      <Stack spacing={3}>
        <Stepper activeStep={activeStep}>
          {autoWrapSteps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <AutoWrapStrategyTransactionButton
          token={token}
          isVisible={activeStep == 0}
        />
        <AutoWrapAllowanceTransactionButton
          token={token}
          isVisible={activeStep == 1}
        />
        <CreateVestingTransactionButton
          setView={setView}
          isVisible={activeStep == 2}
        />
      </Stack>
    );
  }
}
