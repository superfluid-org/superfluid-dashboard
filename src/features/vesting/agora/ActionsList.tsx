import { Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { FC, useEffect, useState } from "react";
import { formatEther } from "viem";
import { ProjectActions, AllowanceActions } from "../../../pages/api/agora";

// Updated ActionsList component as a MUI table with checkboxes
export const ActionsList: FC<{
  actions: (ProjectActions | AllowanceActions)[],
  tokenSymbol: string | undefined,
  onSelectionChange?: (selectedActions: (ProjectActions | AllowanceActions)[]) => void }> = ({ actions, tokenSymbol = "", onSelectionChange }
) => {
    const [selected, setSelected] = useState<number[]>([]);

    // Update selected actions callback whenever selection changes
    useEffect(() => {
        if (onSelectionChange) {
            const selectedActions = selected.map(index => actions[index]);
            onSelectionChange(selectedActions);
        }
    }, [selected, actions, onSelectionChange]);

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = actions.map((_, index) => index);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (_event: React.MouseEvent<unknown>, index: number) => {
        const selectedIndex = selected.indexOf(index);
        let newSelected: number[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, index);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const isSelected = (index: number) => selected.indexOf(index) !== -1;

    // Helper function for formatting amounts
    const formatAmount = (amount: string) => {
        const amountBigInt = BigInt(amount);
        return `${formatEther(amountBigInt)} ${tokenSymbol}`;
    };

    // Helper function for formatting receiver addresses
    const formatReceiver = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    // Get action details based on action type
    const getActionDetails = (action: ProjectActions | AllowanceActions) => {
        let actionType = "";
        let receiver = "";
        let amount = "";
        let fromDate: Date | undefined;
        let toDate: Date | undefined;

        switch (action.type) {
            case "create-vesting-schedule":
                actionType = "Create Vesting Schedule";
                receiver = formatReceiver(action.payload.receiver);
                amount = formatAmount(action.payload.totalAmount);
                fromDate = new Date(action.payload.startDate * 1000);
                toDate = new Date((action.payload.startDate + action.payload.totalDuration) * 1000);
                break;

            case "update-vesting-schedule":
                const prevAmount = formatAmount(action.payload.previousTotalAmount);
                const newAmount = formatAmount(action.payload.totalAmount);
                const isDifference = action.payload.previousTotalAmount !== action.payload.totalAmount;

                actionType = "Update Vesting Schedule";
                receiver = formatReceiver(action.payload.receiver);
                amount = isDifference ? `${prevAmount} → ${newAmount}` : `${newAmount} (unchanged)`;
                break;

            case "stop-vesting-schedule":
                actionType = "Stop Vesting Schedule";
                receiver = formatReceiver(action.payload.receiver);
                break;

            case "increase-token-allowance":
                actionType = "Increase Token Allowance";
                receiver = formatReceiver(action.payload.receiver);
                amount = formatAmount(action.payload.allowanceDelta);
                break;

            case "increase-flow-operator-permissions":
                actionType = "Increase Flow Operator Permissions";
                receiver = formatReceiver(action.payload.receiver);
                amount = `${formatAmount(action.payload.flowRateAllowanceDelta)} per second`;
                break;

            default:
                actionType = `Unknown Action: ${(action as any).type}`;
        }

        return { actionType, receiver, amount, fromDate, toDate };
    };

    if (actions.length === 0) {
        return <Typography variant="body2" color="text.secondary">No actions needed</Typography>;
    }

    return (
        <TableContainer>
            <Table size="small" aria-label="actions table">
                <TableHead>
                    <TableRow>
                        <TableCell padding="checkbox">
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
                        const isItemSelected = isSelected(index);
                        const { actionType, receiver, amount, fromDate, toDate } = getActionDetails(action);

                        return (
                            <TableRow
                                hover
                                onClick={(event) => handleClick(event, index)}
                                role="checkbox"
                                aria-checked={isItemSelected}
                                tabIndex={-1}
                                key={index}
                                selected={isItemSelected}
                            >
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={isItemSelected}
                                        inputProps={{ 'aria-labelledby': `action-${index}` }}
                                    />
                                </TableCell>
                                <TableCell id={`action-${index}`}>
                                    {actionType}
                                </TableCell>
                                <TableCell>{receiver}</TableCell>
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
