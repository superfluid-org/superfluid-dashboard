import { Checkbox, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { formatEther } from "viem";
import { Actions } from "../../../pages/api/agora";
import { SelectableActions } from "./PrimaryPageContent";
import AddressName from "../../../components/AddressName/AddressName";
import AddressCopyTooltip from "../../common/AddressCopyTooltip";
import { UnitOfTime } from "../../send/FlowRateInput";

// Updated ActionsList component as a MUI table with checkboxes
export const ActionsList: FC<{
    actions: SelectableActions[],
    tokenSymbol: string | undefined,
    selectAction: (action: { id: string }) => void;
    deselectAction: (action: { id: string }) => void;
    elevation?: number;
}> = ({ actions, tokenSymbol, selectAction, deselectAction, elevation }) => {

    const selected = useMemo(() => {
        const selectedActions = actions.filter(action => action.selected);
        return selectedActions;
    }, [actions])

    const handleClick = useCallback((action: SelectableActions) => {
        if (action.selected) {
            deselectAction({ id: action.id });
        } else {
            selectAction({ id: action.id });
        }
    }, [selectAction, deselectAction])

    const handleSelectAllClick = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            for (const action of actions) {
                if (!action.selected) {
                    selectAction({ id: action.id });
                }
            }
        } else {
            for (const action of actions) {
                if (action.selected) {
                    deselectAction({ id: action.id });
                }
            }
        }
    }, [selectAction, deselectAction, actions])

    if (actions.length === 0) {
        return <Typography variant="body2" color="text.secondary">No actions needed</Typography>;
    }

    return (
        <TableContainer
            component={Paper}
            elevation={elevation}
        >
            <Table size="small" aria-label="actions table">
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox" align="center">
                            <Checkbox
                                indeterminate={selected.length > 0 && selected.length < actions.length}
                                checked={actions.length > 0 && selected.length === actions.length}
                                onChange={handleSelectAllClick}
                                inputProps={{ 'aria-label': 'select all actions' }}
                            />
                        </TableCell>
                        <TableCell>Action Type</TableCell>
                        <TableCell>Receiver</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>From Date</TableCell>
                        <TableCell>To Date</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {actions.map((action, index) => {
                        const { actionType, receiver, amount, fromDate, toDate } = getActionDetails(action, tokenSymbol);

                        return (
                            <TableRow
                                hover
                                tabIndex={-1}
                                key={index}
                            >
                                <TableCell padding="checkbox" align="center">
                                    <Checkbox
                                        size="small"
                                        checked={action.selected}
                                        inputProps={{ 'aria-labelledby': `action-${index}` }}
                                        onClick={() => handleClick(action)}
                                    />
                                </TableCell>
                                <TableCell>
                                    {actionType}
                                </TableCell>
                                <TableCell>
                                    <AddressCopyTooltip address={receiver}>
                                        <span>
                                            <AddressName address={receiver} />
                                        </span>
                                    </AddressCopyTooltip>
                                </TableCell>
                                <TableCell>{amount}</TableCell>
                                <TableCell>
                                    {fromDate ? (
                                        <Tooltip title={
                                            <>
                                                {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                                <br />
                                                {fromDate.toLocaleString()}
                                            </>
                                        } arrow>
                                            <span>{fromDate.toLocaleDateString()}</span>
                                        </Tooltip>
                                    ) : null}
                                </TableCell>
                                <TableCell>
                                    {toDate ? (
                                        <Tooltip title={
                                            <>
                                                {Intl.DateTimeFormat().resolvedOptions().timeZone}
                                                <br />
                                                {toDate.toLocaleString()}
                                            </>
                                        } arrow>
                                            <span>{toDate.toLocaleDateString()}</span>
                                        </Tooltip>
                                    ) : null}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// Helper function for formatting amounts
const formatAmount = (amount: string, tokenSymbol: string | undefined) => {
    const amountBigInt = BigInt(amount);
    return `${formatEther(amountBigInt)} ${tokenSymbol}`;
};

// Get action details based on action type
const getActionDetails = (action: Actions, tokenSymbol: string | undefined) => {
    let actionType = "";
    let receiver = "";
    let amount = "";
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    switch (action.type) {
        case "create-vesting-schedule":
            actionType = "Create Vesting Schedule";
            receiver = action.payload.receiver;
            amount = formatAmount(action.payload.totalAmount, tokenSymbol);
            fromDate = new Date(action.payload.startDate * 1000);
            toDate = new Date((action.payload.startDate + action.payload.totalDuration) * 1000);
            break;

        case "update-vesting-schedule":
            const prevAmount = formatAmount(action.payload.previousTotalAmount, tokenSymbol);
            const newAmount = formatAmount(action.payload.totalAmount, tokenSymbol);
            const isDifference = action.payload.previousTotalAmount !== action.payload.totalAmount;

            actionType = "Update Vesting Schedule";
            receiver = action.payload.receiver;
            amount = isDifference ? `${prevAmount} → ${newAmount}` : `${newAmount} (unchanged)`;
            toDate = new Date(action.payload.endDate * 1000);
            break;

        case "stop-vesting-schedule":
            actionType = "Stop Vesting Schedule";
            receiver = action.payload.receiver;
            break;

        case "increase-token-allowance":
            actionType = "Increase Token Allowance";
            receiver = action.payload.receiver;
            amount = formatAmount(action.payload.allowanceDelta, tokenSymbol);
            break;

        case "increase-flow-operator-permissions":
            actionType = "Increase Flow Operator Permissions";
            receiver = action.payload.receiver;
            amount = `${formatAmount((BigInt(action.payload.flowRateAllowanceDelta) * BigInt(UnitOfTime.Month)).toString(), tokenSymbol)}/month`;
            break;

        default:
            actionType = `Unknown Action: ${(action as any).type}`;
    }

    return { actionType, receiver, amount, fromDate, toDate };
};
