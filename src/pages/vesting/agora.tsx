import { Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import { BigLoader } from "../../features/vesting/BigLoader";
import { useVisibleAddress } from "../../features/wallet/VisibleAddressContext";
import { useTokenQuery } from "../../hooks/useTokenQuery";
import { NextPageWithLayout } from "../_app";
import { AgoraResponseData } from "../api/agora";
import { PrimaryPageContent } from "../../features/vesting/agora/PrimaryPageContent";
import { RoundType, roundTypes } from "../../features/vesting/agora/constants";
import { optimismSepolia } from "wagmi/chains";

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
        enabled: !!visibleAddress && !!network.id && !!tranch,

        // No need to refetch once it's computed.
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 1200_000 // 20 minutes
    });

    const projectsOverview = data?.success ? data.projectsOverview : null;

    const { data: token } = useTokenQuery(projectsOverview ? {
        chainId: network.id,
        id: projectsOverview?.superTokenAddress
    } : skipToken);

    const errorMessage = data?.success === false ? data.message : error_?.message;

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
        <Container key={roundType} maxWidth="xl" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            <Typography variant="h4" component="h1" gutterBottom sx={{ mt: 2 }}>
                Retro Funding
            </Typography>

            {
                network.id === optimismSepolia.id && (
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
                )
            }

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

            <PrimaryPageContent
                key={projectsOverview.key}
                projectsOverview={projectsOverview}
                token={token}
            />

        </Container>
    );
};

export default AgoraPage;
