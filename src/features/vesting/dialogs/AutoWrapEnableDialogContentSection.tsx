import { Token } from "@superfluid-finance/sdk-core";
import { FC, memo, useMemo } from "react";
import { Network } from "../../network/networks";
import { Button, Stack, Step, StepLabel, Stepper } from "@mui/material";
import AutoWrapStrategyTransactionButton from "../transactionButtons/AutoWrapStrategyTransactionButton";
import AutoWrapAllowanceTransactionButton from "../transactionButtons/AutoWrapAllowanceTransactionButton";
import { toVestingToken } from "../useVestingToken";
import ConnectionBoundary from "../../transactionBoundary/ConnectionBoundary";

const AutoWrapEnableDialogContentSection: FC<{
    closeEnableAutoWrapDialog: () => void,
    isActiveAutoWrapSchedule: boolean,
    isAutoWrapAllowanceSufficient: boolean,
    isAutoWrapLoading: boolean,
    token: Token | undefined,
    network: Network | undefined
}> = ({
    isAutoWrapAllowanceSufficient,
    isActiveAutoWrapSchedule,
    isAutoWrapLoading,
    token,
    network,
    closeEnableAutoWrapDialog
}) => {
        const activeStep = useMemo(() => {
            if (isActiveAutoWrapSchedule) {
                return 0;
            } else if (isAutoWrapAllowanceSufficient) {
                return 1;
            } else {
                return 2;
            }
        }, [isActiveAutoWrapSchedule, isAutoWrapAllowanceSufficient]);

        const autoWrapSteps = [
            { label: "Auto-Wrap" },
            { label: "Allowance" },
        ] as const;

        const isDisabled = !network || !token;

        if (isDisabled) {
            return <Button fullWidth={true}
                data-cy={"enable-auto-wrap-button"}
                variant="contained"
                disabled={true}
                size="large">Add</Button>
        }

        console.log(network, token)
        return <ConnectionBoundary expectedNetwork={network}>
            <Stack spacing={3}>
                <Stepper activeStep={activeStep}>
                    {autoWrapSteps.map((step) => (
                        <Step key={step.label}>
                            <StepLabel>{step.label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                <AutoWrapStrategyTransactionButton
                    token={toVestingToken(token, network)}
                    isVisible={activeStep == 0}
                    isDisabled={isAutoWrapLoading }
                />
                <AutoWrapAllowanceTransactionButton
                    token={toVestingToken(token, network)}
                    isVisible={activeStep == 1}
                    isDisabled={isAutoWrapLoading}
                />
                {activeStep == 2 &&
                    <Button fullWidth={true}
                        data-cy={"enable-auto-wrap-button"}
                        variant="contained"
                        size="medium" onClick={closeEnableAutoWrapDialog}>Close</Button>}
            </Stack>
        </ConnectionBoundary>
    }

export default memo(AutoWrapEnableDialogContentSection);
