import { Token } from "@superfluid-finance/sdk-core";
import { FC, memo, useMemo } from "react";
import { Network } from "../../network/networks";
import { Button, Stack, Step, StepLabel, Stepper } from "@mui/material";
import AutoWrapStrategyTransactionButton from "../transactionButtons/AutoWrapStrategyTransactionButton";
import AutoWrapAllowanceTransactionButton from "../transactionButtons/AutoWrapAllowanceTransactionButton";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import { getSuperTokenType } from "../../redux/endpoints/adHocSubgraphEndpoints";
import { TokenType } from "../../redux/endpoints/tokenTypes";
import useActiveAutoWrap from "../useActiveAutoWrap";
import { VestingToken } from "../CreateVestingSection";
import ConnectionBoundaryButton from "../../transactionBoundary/ConnectionBoundaryButton";

const AutoWrapEnableDialogContentSection: FC<{
  closeEnableAutoWrapDialog: () => void;
  token: Token;
  network: Network;
}> = ({ token, network, closeEnableAutoWrapDialog }) => {
  const { visibleAddress } = useVisibleAddress();

  const isAutoWrappable =
    getSuperTokenType({
      network,
      address: token.id,
      underlyingAddress: token.underlyingAddress,
    }) === TokenType.WrapperSuperToken;

  const {
    isAutoWrapLoading,
    activeAutoWrapSchedule: isActiveAutoWrapSchedule,
    isAutoWrapAllowanceSufficient,
  } = useActiveAutoWrap(
    isAutoWrappable
      ? {
          chainId: network.id,
          accountAddress: visibleAddress!,
          superTokenAddress: token.id,
          underlyingTokenAddress: token.underlyingAddress,
        }
      : "skip"
  );

  const activeStep = useMemo(() => {
    if (!isActiveAutoWrapSchedule) {
      return 0;
    } else if (!isAutoWrapAllowanceSufficient) {
      return 1;
    } else {
      return 2;
    }
  }, [isActiveAutoWrapSchedule, isAutoWrapAllowanceSufficient]);

  const autoWrapSteps = [
    { label: "Auto-Wrap" },
    { label: "Allowance" },
  ] as const;

  return (
    <Stack spacing={3}>
      <Stepper activeStep={activeStep}>
        {autoWrapSteps.map((step) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <ConnectionBoundaryButton
        impersonationTitle={"Stop viewing"}
        changeNetworkTitle={"Change Network"}
        ButtonProps={{
          fullWidth: true,
          variant: "outlined",
          size: "xl",
          sx: {
            display: activeStep == 0 ? "" : "none",
          },
        }}
      >
        <AutoWrapStrategyTransactionButton
          token={token as VestingToken}
          isVisible={activeStep == 0}
          isDisabled={isAutoWrapLoading}
          network={network}
        />
      </ConnectionBoundaryButton>
      <ConnectionBoundaryButton
        impersonationTitle={"Stop viewing"}
        changeNetworkTitle={"Change Network"}
        ButtonProps={{
          fullWidth: true,
          variant: "outlined",
          size: "xl",
          sx: {
            display: activeStep == 1 ? "" : "none",
          },
        }}
      >
        <AutoWrapAllowanceTransactionButton
          token={token as VestingToken}
          isVisible={activeStep == 1}
          isDisabled={isAutoWrapLoading}
          network={network}
        />
      </ConnectionBoundaryButton>
      {activeStep == 2 && (
        <Button
          fullWidth={true}
          data-cy={"enable-auto-wrap-button"}
          variant="contained"
          size="medium"
          onClick={closeEnableAutoWrapDialog}
        >
          Close
        </Button>
      )}
    </Stack>
  );
};

export default memo(AutoWrapEnableDialogContentSection);
