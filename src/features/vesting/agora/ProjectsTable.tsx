import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Collapse, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import { FC, useMemo, useState } from "react";
import { formatEther } from "viem";
import Amount from '../../token/Amount';
import { useTokenQuery } from '../../../hooks/useTokenQuery';
import { ProjectsOverview, ProjectState } from '../../../pages/api/agora';
import { ActionsList } from './ActionsList';
import { ProjectVestingSchedulesTables } from './ProjectVestingSchedulesTable';
import { SelectableActions } from './PrimaryPageContent';

export function ProjectsTable(props: {
    projectsOverview: ProjectsOverview,
    rows: ProjectState[]
    allSelectableActions: SelectableActions[],
    selectAction: (action: { id: string }) => void
    deselectAction: (action: { id: string }) => void
}) {
    const { projectsOverview, rows, allSelectableActions, selectAction, deselectAction } = props;

    const currentTranchNo = projectsOverview.tranchPlan.currentTranchCount;

    return (
        <TableContainer component={Paper}>
            <Table size="small" aria-label="projects overview table">
                <TableHead>
                    <TableRow>
                        <TableCell align="center" colSpan={3}>
                        </TableCell>
                        <TableCell align="center" colSpan={6}>
                            Tranches
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell padding="checkbox">
                        </TableCell>
                        <TableCell padding="checkbox">Status</TableCell>
                        <TableCell>Project Name(s)</TableCell>
                        <TableCell sx={{ ...tranchColumnSxProps, bgcolor: currentTranchNo === 1 ? 'action.hover' : "" }} >Tranch 1</TableCell>
                        <TableCell sx={{ ...tranchColumnSxProps, bgcolor: currentTranchNo === 2 ? 'action.hover' : "" }} >Tranch 2</TableCell>
                        <TableCell sx={{ ...tranchColumnSxProps, bgcolor: currentTranchNo === 3 ? 'action.hover' : "" }} >Tranch 3</TableCell>
                        <TableCell sx={{ ...tranchColumnSxProps, bgcolor: currentTranchNo === 4 ? 'action.hover' : "" }} >Tranch 4</TableCell>
                        <TableCell sx={{ ...tranchColumnSxProps, bgcolor: currentTranchNo === 5 ? 'action.hover' : "" }} >Tranch 5</TableCell>
                        <TableCell sx={{ ...tranchColumnSxProps, bgcolor: currentTranchNo === 6 ? 'action.hover' : "" }} >Tranch 6</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <Row
                            key={row.agoraEntry.id}
                            currentTranchNo={currentTranchNo}
                            chainId={projectsOverview.chainId}
                            superTokenAddress={projectsOverview.superTokenAddress}
                            state={row}
                            allSelectableActions={allSelectableActions}
                            selectAction={selectAction}
                            deselectAction={deselectAction}
                        />
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

// # Row

const tranchColumnSxProps = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    px: 3,
    borderRight: 1,
    borderLeft: 1,
    borderColor: 'divider'
} as const;

const TranchCell: FC<{
    currentTranchNo: number
    tranchNo: number
    allocation?: { amount: string }
    tokenSymbol?: string
}> = ({ currentTranchNo, tranchNo, allocation, tokenSymbol }) => {
    return (
        <TableCell
            sx={{
                ...tranchColumnSxProps,
                bgcolor: currentTranchNo === tranchNo ? 'action.hover' : ""
            }}
        >
            {allocation?.amount ? (
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    gap={1.5}
                >
                    <Amount wei={allocation.amount} disableRounding mono />
                    <Typography variant="tooltip" color="text.secondary">
                        {tokenSymbol}
                    </Typography>
                </Stack>
            ) : '—'}
        </TableCell>
    );
};

function Status(props: { state: ProjectState }) {

    const getStatusInfo = () => {
        if (!props.state.agoraEntry.KYCStatusCompleted) {
            return { color: "text.disabled", message: "KYC not done" };
        }
        else if (props.state.projectActions.length > 0) {
            return { color: "warning.main", message: "Actions pending" };
        } else if (props.state.agoraTotalAmount !== props.state.subgraphTotalAmount) {
            return { color: "error.main", message: "Mismatch of amounts" };
        } else {
            return { color: "success.main", message: "All good" };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <Tooltip title={statusInfo.message} arrow>
            <Box
                sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    bgcolor: statusInfo.color,
                    display: 'inline-block',
                    verticalAlign: 'middle'
                }}
            />
        </Tooltip>
    );
}

function Row(props: {
    currentTranchNo: number,
    chainId: number,
    superTokenAddress: string,
    state: ProjectState,
    allSelectableActions: SelectableActions[],
    selectAction: (action: { id: string }) => void,
    deselectAction: (action: { id: string }) => void
}) {
    const { state, currentTranchNo, allSelectableActions, selectAction, deselectAction } = props;
    const [open, setOpen] = useState(false);

    const allocations = useMemo(() => {
        return state.agoraEntry.amounts.map((amount, index) => ({
            tranch: index + 1,
            amount: amount
        }));
    }, [state.agoraEntry.amounts]);

    const { data: token } = useTokenQuery({
        chainId: props.chainId,
        id: props.superTokenAddress
    });

    const projectSelectableActions = useMemo(() => {
        const projectActionIds = state.projectActions.map(x => x.id);
        return allSelectableActions.filter(x => projectActionIds.includes(x.id));
    }, [allSelectableActions, state]);

    return (
        <>
            <TableRow
                sx={{
                    '& > *': { borderBottom: 'unset' },
                    opacity: state.agoraEntry.KYCStatusCompleted ? 1 : 0.6,
                    bgcolor: projectSelectableActions.some(x => x.selected) ? "action.selected" : "inherit"
                }}
            >
                <TableCell align="center" padding="none" sx={{ px: 0.5, py: 0.5 }}>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                        sx={{
                            m: 0,
                            p: 0.5,
                            minWidth: "75px"
                        }}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell size="small" align="center" sx={{ px: 1.5 }}>
                    <Status state={state} />
                </TableCell>
                <TableCell sx={{
                    whiteSpace: 'nowrap',
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {state.agoraEntry.projectNames.map((name) => (
                        <Typography
                            key={name}
                            component="span"
                            variant="body2"
                            noWrap
                            display="block"
                        >
                            {name}
                        </Typography>
                    ))}
                </TableCell>
                {[1, 2, 3, 4, 5, 6].map(tranchNo => (
                    <TranchCell
                        key={tranchNo}
                        currentTranchNo={currentTranchNo}
                        tranchNo={tranchNo}
                        allocation={allocations[tranchNo - 1]}
                        tokenSymbol={token?.symbol}
                    />
                ))}
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2 }}>
                            <Box sx={{ ml: 1, mt: 1 }}>
                                <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                                        Project name(s):
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                    >
                                        {state.agoraEntry.projectNames.join(', ')}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                                        Current wallet:
                                    </Typography>
                                    <Typography
                                        variant="body2mono"
                                    >
                                        {state.currentWallet}
                                    </Typography>
                                </Box>

                                {state.agoraEntry.wallets.length > 1 && (
                                    <Box sx={{ display: 'flex' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                                            Previous wallets:
                                        </Typography>
                                        <Box>
                                            {state.agoraEntry.wallets.slice(0, -1).map((wallet, index) => (
                                                <Typography
                                                    key={index}
                                                    variant="body2"
                                                    sx={{
                                                        fontFamily: 'monospace',
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {wallet}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                                        Agora total:
                                    </Typography>
                                    <Typography variant="body2">
                                        {state.agoraTotalAmount ? `${formatEther(BigInt(state.agoraTotalAmount))} ${token?.symbol}` : '—'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                                        Vesting total:
                                    </Typography>
                                    <Typography variant="body2">
                                        {state.subgraphTotalAmount ? `${formatEther(BigInt(state.subgraphTotalAmount))} ${token?.symbol}` : '—'}
                                    </Typography>
                                </Box>
                            </Box>

                            {
                                state.allRelevantSchedules.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Vesting schedules:
                                        </Typography>
                                        <ProjectVestingSchedulesTables project={state} />
                                    </Box>
                                )
                            }

                            {state.projectActions.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Pending Actions ({state.projectActions.length}):
                                    </Typography>
                                    <ActionsList
                                        actions={projectSelectableActions}
                                        tokenSymbol={token?.symbol}
                                        selectAction={selectAction}
                                        deselectAction={deselectAction}
                                        elevation={0}
                                    />
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

        </>
    );
}
