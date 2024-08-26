import { useFormContext } from "react-hook-form";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import AutoWrapAllowanceTransactionButton from "./AutoWrapAllowanceTransactionButton";
import AutoWrapStrategyTransactionButton from "./AutoWrapStrategyTransactionButton";
import { CreateVestingTransactionButton } from "./CreateVestingTransactionButton";
import { ValidVestingForm } from "../CreateVestingFormProvider";
import { CreateVestingCardView } from "../CreateVestingSection";
import { Network } from "../../network/networks";
import { Stack, Step, StepLabel, Stepper } from "@mui/material";
import useActiveAutoWrap from "../useActiveAutoWrap";
import { SuperTokenMinimal } from "../../redux/endpoints/tokenTypes";

export interface VestingTransactionSectionProps {
  network: Network;
  token: SuperTokenMinimal;
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
    isAutoWrapLoading,
    activeAutoWrapSchedule,
    isAutoWrapAllowanceSufficient,
  } = useActiveAutoWrap(
    setupAutoWrap && visibleAddress
      ? {
          chainId: network.id,
          accountAddress: visibleAddress,
          superTokenAddress: token.address,
          underlyingTokenAddress: token.underlyingAddress!, // TODO: get rid of bang?
        }
      : "skip"
  );

  if (!setupAutoWrap) {
    return (
      <CreateVestingTransactionButton setView={setView} isVisible={true} />
    );
  } else {
    const activeStep = !activeAutoWrapSchedule
      ? 0
      : !isAutoWrapAllowanceSufficient
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
          isDisabled={isAutoWrapLoading}
          network={network}
        />
        <AutoWrapAllowanceTransactionButton
          token={token}
          isVisible={activeStep == 1}
          isDisabled={isAutoWrapLoading}
          network={network}
        />
        <CreateVestingTransactionButton
          setView={setView}
          isVisible={activeStep == 2}
        />
      </Stack>
    );
  }
}
