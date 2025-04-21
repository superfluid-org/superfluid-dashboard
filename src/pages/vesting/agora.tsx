import { Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import ConnectionBoundary from "../../features/transactionBoundary/ConnectionBoundary";
import { BigLoader } from "../../features/vesting/BigLoader";
import { useVisibleAddress } from "../../features/wallet/VisibleAddressContext";
import { useTokenQuery } from "../../hooks/useTokenQuery";
import { NextPageWithLayout } from "../_app";
import { Actions, AgoraResponseData, RoundType, roundTypes } from "../api/agora";
import { DownloadGnosisSafeTransactionButton, ExecuteTranchUpdateTransactionButton } from '../../features/vesting/agora/buttons';
import { ActionsList } from '../../features/vesting/agora/ActionsList';
import { ProjectsTable } from '../../features/vesting/agora/ProjectsTable';

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

    const [roundType, setRoundType] = useState<RoundType>("onchain_builders");
    const handleRoundTypeChange = (
        event: React.MouseEvent<HTMLElement>,
        newRoundType: RoundType | null
    ) => {
        if (newRoundType !== null) {
            setRoundType(newRoundType);
        }
    };

    const { data, isLoading, error: error_ } = useQuery({
        queryKey: ['agora', visibleAddress ?? null, network.id, tranch, roundType],
        queryFn: () => fetch(`/api/agora?sender=${visibleAddress}&chainId=${network.id}&tranch=${tranch}&type=${roundType}`).then(async (res) => (await res.json()) as AgoraResponseData),
        enabled: !!visibleAddress && !!network.id && !!tranch
    });

    const errorMessage = data?.success === false ? data.message : error_?.message;

    const rows = useMemo(() => {
        if (!data?.success) return [];
        return [...data.projectsOverview.projects].sort((a, b) => {
            // Sort KYC completed first, non-KYC last
            if (a.agoraEntry.KYCStatusCompleted && !b.agoraEntry.KYCStatusCompleted) return -1;
            if (!a.agoraEntry.KYCStatusCompleted && b.agoraEntry.KYCStatusCompleted) return 1;
            return 0;
        });
    }, [data]);

    const projectsOverview = data?.success ? data.projectsOverview : null;

    const { data: token } = useTokenQuery(projectsOverview ? {
        chainId: network.id,
        id: projectsOverview?.superTokenAddress
    } : skipToken);

    const allActions = useMemo(() => {
        if (!data?.success) return [];
        return [
            ...(data.projectsOverview.allowanceActions || []),
            ...rows.flatMap(row => row.projectActions),
        ];
    }, [data, rows]);

    const [actionsToExecute, setActionsToExecute] = useState<Actions[]>([]);

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

    const areButtonsDisabled = allActions.length === 0;

    return (
        <Container key={roundType} maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ mb: 3, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Tranch (Temporary selection for mock API)
                </Typography>
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

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Round Type
                </Typography>
                <ToggleButtonGroup
                    value={roundType}
                    exclusive
                    onChange={handleRoundTypeChange}
                    aria-label="round type"
                    size="small"
                >
                    <ToggleButton value={roundTypes.onchain_builders} aria-label="onchain builders">
                        Onchain Builders
                    </ToggleButton>
                    <ToggleButton value={roundTypes.dev_tooling} aria-label="dev tooling">
                        Dev Tooling
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Typography variant="h6" gutterBottom>
                Projects Overview
            </Typography>

            <ProjectsTable projectsOverview={projectsOverview} rows={rows} />

            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Pending Actions ({allActions.length})
            </Typography>

            <Paper elevation={1} sx={{ p: 2 }}>
                <ActionsList actions={allActions} tokenSymbol={token?.symbol} onSelectionChange={setActionsToExecute} />
            </Paper>

            <ConnectionBoundary expectedNetwork={network}>
                {
                    projectsOverview && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                            <Stack direction="column" spacing={1.25} sx={{ width: 'auto' }}>
                                <ExecuteTranchUpdateTransactionButton isDisabled={areButtonsDisabled} projectsOverview={projectsOverview} actionsToExecute={actionsToExecute} />
                                <DownloadGnosisSafeTransactionButton isDisabled={areButtonsDisabled} projectsOverview={projectsOverview} actionsToExecute={actionsToExecute} />
                            </Stack>
                        </Box>
                    )
                }
            </ConnectionBoundary>
        </Container>
    );
};

export default AgoraPage;
