import { useQuery } from "@tanstack/react-query";
import { NextPageWithLayout } from "../_app";
import { useVisibleAddress } from "../../features/wallet/VisibleAddressContext";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import { Actions, AgoraResponseData, ProjectsOverview, ProjectState } from "../api/agora";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Collapse, Box, Typography, IconButton, Container, FormControl, InputLabel, Select, MenuItem, List, ListItem, ListItemText, Divider, ListItemIcon, Button, useMediaQuery } from "@mui/material";
import { FC, Fragment, useEffect, useMemo, useState } from "react";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import UpdateIcon from '@mui/icons-material/Update';
import StopIcon from '@mui/icons-material/Stop';
import { formatEther } from "viem";
import { BigLoader } from "../../features/vesting/BigLoader";
import ConnectionBoundary, { useConnectionBoundary } from "../../features/transactionBoundary/ConnectionBoundary";
import { rpcApi } from "../../features/redux/store";
import { TransactionBoundary } from "../../features/transactionBoundary/TransactionBoundary";
import { TransactionButton, transactionButtonDefaultProps } from "../../features/transactionBoundary/TransactionButton";
import { TransactionDialogActions, TransactionDialogButton } from "../../features/transactionBoundary/TransactionDialog";
import NextLink from "next/link";
import { useAccount } from "wagmi";
import VestingRow from "../../features/vesting/VestingRow";
import { useRouter } from "next/router";
import { useTokenQuery } from "../../hooks/useTokenQuery";
import JSZip from "jszip";
import { mapProjectStateIntoGnosisSafeBatch } from "../../features/redux/endpoints/vestingAgoraEndpoints";
import { TxBuilder } from "../../libs/gnosis-tx-builder";

// Updated ActionsList component without the badges
const ActionsList: FC<{ actions: Actions[] }> = ({ actions }) => {
    if (actions.length === 0) {
        return <Typography variant="body2" color="text.secondary">No actions needed</Typography>;
    }

    return (
        <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
            {actions.map((action, index) => {
                // For calculating differences in update actions
                const formatAmount = (amount: string) => {
                    const amountBigInt = BigInt(amount);
                    return `${formatEther(amountBigInt)} OPx`;
                };

                // Determine icon and content based on action type
                let icon, primaryText, secondaryText;

                switch (action.type) {
                    case "create-vesting-schedule":
                        const startDate = new Date(action.payload.startDate * 1000).toLocaleString();
                        const endDate = new Date((action.payload.startDate + action.payload.totalDuration) * 1000).toLocaleString();

                        icon = <AddIcon color="success" />;
                        primaryText = `Create Vesting Schedule for ${action.payload.receiver.slice(0, 6)}...${action.payload.receiver.slice(-4)}`;
                        secondaryText = `Amount: ${formatAmount(action.payload.totalAmount)} | Start: ${startDate} | End: ${endDate}`;
                        break;

                    case "update-vesting-schedule":
                        const prevAmount = formatAmount(action.payload.previousTotalAmount);
                        const newAmount = formatAmount(action.payload.totalAmount);
                        const isDifference = action.payload.previousTotalAmount !== action.payload.totalAmount;

                        icon = <UpdateIcon color="primary" />;
                        primaryText = `Update Vesting Schedule for ${action.payload.receiver.slice(0, 6)}...${action.payload.receiver.slice(-4)}`;
                        secondaryText = isDifference ?
                            `Amount: ${prevAmount} → ${newAmount}` :
                            `Amount: ${newAmount} (unchanged)`;
                        break;

                    case "stop-vesting-schedule":
                        // Since end date isn't in the type yet, we'll add dummy code
                        const dummyEndDate = new Date().toLocaleString();

                        icon = <StopIcon color="error" />;
                        primaryText = `Stop Vesting Schedule for ${action.payload.receiver.slice(0, 6)}...${action.payload.receiver.slice(-4)}`;
                        secondaryText = `End Date: ${dummyEndDate}`;
                        break;

                    default:
                        icon = <IconButton>?</IconButton>;
                        primaryText = `Unknown Action: ${(action as any).type}`;
                        secondaryText = "Details not available";
                }

                return (
                    <Fragment key={index}>
                        <ListItem alignItems="flex-start">
                            <ListItemIcon>{icon}</ListItemIcon>
                            <ListItemText
                                primary={primaryText}
                                secondary={
                                    <Typography
                                        sx={{ display: 'inline' }}
                                        component="span"
                                        variant="body2"
                                        color="text.primary"
                                    >
                                        {secondaryText}
                                    </Typography>
                                }
                            />
                        </ListItem>
                        {index < actions.length - 1 && <Divider variant="inset" component="li" />}
                    </Fragment>
                );
            })}
        </List>
    );
};

const AgoraPage: NextPageWithLayout = () => {
    const { visibleAddress } = useVisibleAddress();
    const { network } = useExpectedNetwork();
    const { isConnected, isConnecting, isReconnecting } = useAccount();
    const isWalletConnecting = !isConnected && (isConnecting || isReconnecting);

    const [tranch, setTranch] = useState(() => {
        // Try to get the value from localStorage
        const savedTranch = typeof window !== 'undefined' ? localStorage.getItem('selectedTranch') : null;
        // Return the saved value or default to 1
        return savedTranch ? parseInt(savedTranch, 10) : 1;
    });

    // Update localStorage when tranch changes
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('selectedTranch', tranch.toString());
        }
    }, [tranch]);

    const { data, isLoading, error: error_ } = useQuery({
        queryKey: ['agora', visibleAddress ?? null, network.id, tranch],
        queryFn: () => fetch(`/api/agora?sender=${visibleAddress}&chainId=${network.id}&tranch=${tranch}`).then(async (res) => (await res.json()) as AgoraResponseData),
        enabled: !!visibleAddress && !!network.id && !!tranch
    });

    const errorMessage = data?.success === false ? data.message : error_?.message;

    const rows = data?.success ? data.projectsOverview.projects : [];
    const projectsOverview = data?.success ? data.projectsOverview : null;

    const allActions = useMemo(() => {
        return rows.flatMap(row => row.todo);
    }, [data]);

    if (isLoading || isWalletConnecting) {
        // TODO: use skeleton table?
        return (
            <Container maxWidth="lg">
                <BigLoader />
            </Container>
        );
    }

    // Show message if wallet is not connected
    if (!isConnected) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        Please connect your wallet
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        You need to connect your wallet to view vesting information.
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (errorMessage) {
        return (
            <Container maxWidth="lg">
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        my: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <Typography variant="h5" color="error" gutterBottom>
                        Error Occurred
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {errorMessage}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                window.location.reload()
                            }}
                        >
                            Reload app
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    if (!projectsOverview) {
        return null;
    }

    return (
        <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ mb: 3, mt: 2 }}>
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel id="tranch-select-label">Tranch</InputLabel>
                    <Select
                        labelId="tranch-select-label"
                        id="tranch-select"
                        value={tranch}
                        label="Tranch"
                        onChange={(e) => setTranch(Number(e.target.value))}
                    >
                        <MenuItem value={1}>Tranch 1</MenuItem>
                        <MenuItem value={2}>Tranch 2</MenuItem>
                        <MenuItem value={3}>Tranch 3</MenuItem>
                        <MenuItem value={4}>Tranch 4</MenuItem>
                        <MenuItem value={5}>Tranch 5</MenuItem>
                        <MenuItem value={6}>Tranch 6</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <Typography variant="h6" gutterBottom>
                Projects Overview
            </Typography>

            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Tranch 1</TableCell>
                            <TableCell>Tranch 2</TableCell>
                            <TableCell>Tranch 3</TableCell>
                            <TableCell>Tranch 4</TableCell>
                            <TableCell>Tranch 5</TableCell>
                            <TableCell>Tranch 6</TableCell>
                            <TableCell>KYC</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <Row key={row.agoraEntry.projectId} chainId={projectsOverview.chainId} superTokenAddress={projectsOverview.superTokenAddress} state={row} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Pending Actions ({allActions.length})
            </Typography>

            <Paper elevation={1} sx={{ p: 2 }}>
                <ActionsList actions={allActions} />
            </Paper>

            <ConnectionBoundary expectedNetwork={network}>
                {
                    projectsOverview && (
                        <>
                            <ExecuteTranchUpdateTransactionButton isVisible={true} projectsOverview={projectsOverview} />
                            <DownloadGnosisSafeTransactionButton isVisible={true} projectsOverview={projectsOverview} />
                        </>
                    )
                }
            </ConnectionBoundary>
        </Container>
    );
};

function Row(props: { chainId: number, superTokenAddress: string, state: ProjectState }) {
    const { state } = props;
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

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell>{state.agoraEntry.projectName}</TableCell>
                <TableCell>{allocations[0]?.amount ? `${formatEther(BigInt(allocations[0]!.amount))} ${token?.symbol}` : '—'}</TableCell>
                <TableCell>{allocations[1]?.amount ? `${formatEther(BigInt(allocations[1]!.amount))} ${token?.symbol}` : '—'}</TableCell>
                <TableCell>{allocations[2]?.amount ? `${formatEther(BigInt(allocations[2]!.amount))} ${token?.symbol}` : '—'}</TableCell>
                <TableCell>{allocations[3]?.amount ? `${formatEther(BigInt(allocations[3]!.amount))} ${token?.symbol}` : '—'}</TableCell>
                <TableCell>{allocations[4]?.amount ? `${formatEther(BigInt(allocations[4]!.amount))} ${token?.symbol}` : '—'}</TableCell>
                <TableCell>{allocations[5]?.amount ? `${formatEther(BigInt(allocations[5]!.amount))} ${token?.symbol}` : '—'}</TableCell>
                <TableCell>{state.agoraEntry.KYCStatusCompleted ? <DoneIcon /> : <CloseIcon />}</TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2 }}>
                            {/* <Typography variant="subtitle1" gutterBottom>
                                Wallet Information
                            </Typography> */}

                            <Box sx={{ ml: 2, mt: 1 }}>
                                <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ width: 120 }}>
                                        Current wallet:
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontFamily: 'monospace' }}
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
                            </Box>

                            <Box sx={{ mt: 2 }}>
                                <ProjectVestingSchedulesTables project={state} />
                            </Box>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

        </>
    );
}

export default AgoraPage;

type Props = {
    isVisible: boolean;
    projectsOverview: ProjectsOverview;
}

export const DownloadGnosisSafeTransactionButton: FC<Props> = ({
    isVisible,
    projectsOverview
}) => {

    return (
        <Button {...transactionButtonDefaultProps} variant="outlined" onClick={async () => {
            const zip = new JSZip();
            const zipName = `execute-tranch-${projectsOverview.tranchPlan.currentTranchCount}_for_safe_tx-builder`;
            const batchFolder = zip.folder(zipName);

            const transactions = mapProjectStateIntoGnosisSafeBatch(projectsOverview);

            const safeTxBuilderJSON = TxBuilder.batch(undefined, transactions, {
                chainId: projectsOverview.chainId
            });

            const blob = new Blob([JSON.stringify(safeTxBuilderJSON)], {
                type: "application/json",
            });

            batchFolder?.file(`batch.json`, blob);

            const objectURL = URL.createObjectURL(
                (await batchFolder?.generateAsync({ type: "blob" })) as Blob
            );

            const a = document.createElement('a');
            a.href = objectURL;
            a.download = zipName + ".zip";
            document.body.appendChild(a);
            a.click();

            // Clean up by revoking the object URL and removing the link
            URL.revokeObjectURL(objectURL);
            document.body.removeChild(a);
        }}>
            Download Safe Transaction Builder JSON
        </Button>
    )
}

export const ExecuteTranchUpdateTransactionButton: FC<Props> = ({
    isVisible: isVisible_,
    projectsOverview
}) => {
    const [executeTranchUpdate, executeTranchUpdateResult] =
        rpcApi.useExecuteTranchUpdateMutation();

    const isVisible = !executeTranchUpdateResult.isSuccess && isVisible_;

    return (
        <TransactionBoundary mutationResult={executeTranchUpdateResult}>
            {({
                network,
                getOverrides,
                setDialogLoadingInfo,
                setDialogSuccessActions,
                txAnalytics
            }) =>
                isVisible && (
                    <TransactionButton
                        dataCy={"create-schedule-tx-button"}
                        disabled={false}
                        onClick={async (signer) => {
                            setDialogLoadingInfo(
                                <Typography
                                    variant="h5"
                                    color="text.secondary"
                                    translate="yes"
                                >
                                    You are executing a tranch update.
                                </Typography>
                            );

                            executeTranchUpdate({
                                signer,
                                ...projectsOverview
                            }).unwrap();

                            setDialogSuccessActions(
                                <TransactionDialogActions>
                                    <NextLink href="/vesting" passHref legacyBehavior>
                                        <TransactionDialogButton
                                            data-cy="ok-button"
                                            color="primary"
                                        >
                                            OK
                                        </TransactionDialogButton>
                                    </NextLink>
                                </TransactionDialogActions>
                            );
                        }}>
                        Execute Tranch Update
                    </TransactionButton>
                )
            }
        </TransactionBoundary>
    );
};

const ProjectVestingSchedulesTables: FC<{
    project: ProjectState
}> = ({ project }) => {
    const { network } = useExpectedNetwork();

    const router = useRouter();
    const openDetails = (id: string) => () =>
        router.push(`/vesting/${network.slugName}/${id}`);

    if (project.allRelevantSchedules.length === 0) {
        return null;
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableBody>
                    {
                        project.allRelevantSchedules
                            .map((vestingSchedule) => (
                                <VestingRow
                                    key={vestingSchedule.id}
                                    network={network}
                                    vestingSchedule={vestingSchedule}
                                    onClick={openDetails(vestingSchedule.id)}
                                />
                            ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );
};