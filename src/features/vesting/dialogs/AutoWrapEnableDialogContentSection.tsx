import { FC, memo, useMemo } from "react";
import { Network } from "../../network/networks";
import { Button, Stack, Step, StepLabel, Stepper } from "@mui/material";
import AutoWrapStrategyTransactionButton from "../transactionButtons/AutoWrapStrategyTransactionButton";
import AutoWrapAllowanceTransactionButton from "../transactionButtons/AutoWrapAllowanceTransactionButton";
import { useVisibleAddress } from "../../wallet/VisibleAddressContext";
import { SuperTokenMinimal, TokenType } from "../../redux/endpoints/tokenTypes";
import useActiveAutoWrap from "../useActiveAutoWrap";
import ConnectionBoundaryButton from "../../transactionBoundary/ConnectionBoundaryButton";
import { useTokenQuery } from "../../../hooks/useTokenQuery";

const AutoWrapEnableDialogContentSection: FC<{
  closeEnableAutoWrapDialog: () => void;
  token: SuperTokenMinimal;
  network: Network;
}> = ({ token: token_, network, closeEnableAutoWrapDialog }) => {
  const { visibleAddress } = useVisibleAddress();

  const tokenQuery = useTokenQuery({
    chainId: network.id,
    id: token_.address
  });
  const token = tokenQuery.data as SuperTokenMinimal | null | undefined; // TODO: get rid of the cast
  const isAutoWrappable = token?.type === TokenType.WrapperSuperToken;

  const {
    isAutoWrapLoading,
    activeAutoWrapSchedule: isActiveAutoWrapSchedule,
    isAutoWrapAllowanceSufficient,
  } = useActiveAutoWrap(
    isAutoWrappable && visibleAddress
      ? {
        chainId: network.id,
        accountAddress: visibleAddress,
        superTokenAddress: token.address,
        underlyingTokenAddress: token.underlyingAddress!,
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
        {
          token && ( // TODO: Get rid of this
            <AutoWrapStrategyTransactionButton
              token={token}
              isVisible={activeStep == 0}
              isDisabled={isAutoWrapLoading}
              network={network}
            />
          )
        }
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
        {
          token && (
            <AutoWrapAllowanceTransactionButton
              token={token}
              isVisible={activeStep == 1}
              isDisabled={isAutoWrapLoading}
              network={network}
            />
          )
        }
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
