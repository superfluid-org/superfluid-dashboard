import { useQuery } from "@tanstack/react-query";
import { NextPageWithLayout } from "../_app";
import { useVisibleAddress } from "../../features/wallet/VisibleAddressContext";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import { AgoraResponseData, ProjectState } from "../api/agora";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Collapse, Box, Typography, IconButton, Container, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { formatEther } from "viem";
import { BigLoader } from "../../features/vesting/BigLoader";

const AgoraPage: NextPageWithLayout = () => {
    const { visibleAddress } = useVisibleAddress();
    const { network } = useExpectedNetwork();

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

    if (isLoading) {
        // TODO: use skeleton table?
        return (
            <Container maxWidth="lg">
                <BigLoader />
            </Container>
        );
    }

    if (errorMessage) {
        // TODO: can handle better...
        return <div>Error: {errorMessage}</div>;
    }

    const rows = data?.success ? data.projectsOverview.projects : [];

    return (
        <Container maxWidth="lg">
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
            
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Project</TableCell>
                            <TableCell>Total Allocation</TableCell>
                            <TableCell>KYC</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row) => (
                            <Row key={row.agoraEntry.projectId} state={row} />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

function Row(props: { state: ProjectState }) {
    const { state } = props;
    const [open, setOpen] = useState(state.agoraEntry.KYCStatusCompleted);

    const allocation = useMemo(() => {
        return state.agoraEntry.amounts.reduce((acc, amount) => {
            return acc + BigInt(amount);
        }, BigInt(0));
    }, [state.agoraEntry.amounts]);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>{state.agoraEntry.projectName}</TableCell>
                <TableCell>{formatEther(allocation)} OPx</TableCell>
                <TableCell>{state.agoraEntry.KYCStatusCompleted ? <DoneIcon /> : <CloseIcon />}</TableCell>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
                    <Collapse in={open} timeout="auto" unmountOnExit>

                        <Typography>
                            Current wallet: {state.currentWallet}
                        </Typography>

                        {
                            state.previousWallet && (
                                <Typography>
                                    Previous wallet: {state.previousWallet}
                                </Typography>
                            )
                        }

                        {/* <Box sx={{ margin: 1 }}> */}
                        <Table size="small" aria-label="tranches">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tranch</TableCell>
                                    <TableCell>Allocation</TableCell>
                                    <TableCell></TableCell>
                                    <TableCell></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {state.allocations.map((allocation) => (
                                    <TableRow key={allocation.tranch}>
                                        <TableCell>
                                            {allocation.tranch}
                                        </TableCell>
                                        <TableCell>{formatEther(BigInt(allocation.amount))} OPx</TableCell>
                                        <TableCell></TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>

                        </Table>
                        {/* </Box> */}

                    </Collapse>
                </TableCell>
            </TableRow>

        </>
    );
}

export default AgoraPage;