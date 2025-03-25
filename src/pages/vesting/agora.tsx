import { useQuery } from "@tanstack/react-query";
import { NextPageWithLayout } from "../_app";
import { useVisibleAddress } from "../../features/wallet/VisibleAddressContext";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import { AgoraResponseData, ProjectState } from "../api/agora";
import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Collapse, Box, Typography, IconButton, Container } from "@mui/material";
import { useMemo, useState } from "react";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DoneIcon from '@mui/icons-material/Done';
import CloseIcon from '@mui/icons-material/Close';
import { formatEther } from "viem";

const AgoraPage: NextPageWithLayout = () => {
    const { visibleAddress } = useVisibleAddress();
    const { network } = useExpectedNetwork();

    const { data, isLoading, error: error_ } = useQuery({
        queryKey: ['agora', visibleAddress ?? null, network.id],
        queryFn: () => fetch(`/api/agora?sender=${visibleAddress}&chainId=${network.id}`).then(async (res) => (await res.json()) as AgoraResponseData),
        enabled: !!visibleAddress && !!network.id
    });

    const errorMessage = data?.success === false ? data.message : error_?.message;

    if (isLoading) {
        // TODO: use skeleton table?
        return <div>Loading...</div>;
    }

    if (errorMessage) {
        // TODO: can handle better...
        return <div>Error: {errorMessage}</div>;
    }

    const rows = data?.success ? data.projectsOverview.projects : [];

    return (
        <Container maxWidth="lg">
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