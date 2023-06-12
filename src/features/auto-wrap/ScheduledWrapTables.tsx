import {
    Button,
    Stack,
    Typography,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, useCallback, useMemo, useRef, useState } from "react";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import { useActiveNetworks } from "../network/ActiveNetworksContext";
import NetworkSelectionFilter from "../network/NetworkSelectionFilter";
import ScheduledWrapEmptyCard from "./ScheduledWrapEmptyCard";
import ScheduledWrapLoadingTable from "./ScheduledWrapLoadingTable";
import { platformApi } from "../redux/platformApi/platformApi";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import ScheduledWrapApplyCard from "./ScheduledWrapApplyCard";
import { FetchingStatus, NetworkFetchingStatuses } from "../tokenSnapshotTable/TokenSnapshotTables";
import ScheduledWrapTable from "./ScheduledWrapTable";
import AutoWrapAddTokenButtonSection from "./AutoWrapAddTokenButtonSection";

interface ScheduledWrapTablesProps {
    address: Address;
}

const ScheduledWrapTables: FC<ScheduledWrapTablesProps> = ({ address }) => {
    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
    const { activeNetworks } = useActiveNetworks();
    const { network } = useExpectedNetwork();

    const networkSelectionRef = useRef<HTMLButtonElement>(null);

    const [fetchingStatuses, setFetchingStatuses] =
        useState<NetworkFetchingStatuses>({});

    const [networkSelectionOpen, setNetworkSelectionOpen] = useState(false);

    const openNetworkSelection = () => setNetworkSelectionOpen(true);
    const closeNetworkSelection = () => setNetworkSelectionOpen(false);

    const fetchingCallback = useCallback(
        (networkId: number, fetchingStatus: FetchingStatus) =>
            setFetchingStatuses((currentStatuses) => ({
                ...currentStatuses,
                [networkId]: fetchingStatus,
            })),
        []
    );

    const hasContent = useMemo(
        () =>
            !!activeNetworks.some(
                (activeNetwork) => fetchingStatuses[activeNetwork.id]?.hasContent
            ),
        [activeNetworks, fetchingStatuses]
    );

    const isLoading = useMemo(
        () =>
            !!activeNetworks.some(
                (activeNetwork) =>
                    fetchingStatuses[activeNetwork.id]?.isLoading !== false
            ),
        [activeNetworks, fetchingStatuses]
    );

    const { isPlatformWhitelisted, isLoading: isWhitelistLoading } = platformApi.useIsAccountWhitelistedQuery(
        address && network?.platformUrl
            ? {
                chainId: network.id,
                baseUrl: network.platformUrl,
                account: address?.toLowerCase(),
            }
            : skipToken,
        {
            selectFromResult: (queryResult) => ({
                ...queryResult,
                isPlatformWhitelisted: !!queryResult.data,
            }),
        }
    );

    if (((!isLoading || !isWhitelistLoading) && !isPlatformWhitelisted)) {
        return <ScheduledWrapApplyCard />
    }

    return (
        <>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
                translate="yes"
            >
                <Typography variant={isBelowMd ? "h3" : "h4"} component="h1">
                    Auto Wrap
                </Typography>

                <Stack direction={"row"} gap={1.5}>
                    <AutoWrapAddTokenButtonSection/>
                    <Button
                        data-cy={"network-selection-button"}
                        ref={networkSelectionRef}
                        variant="outlined"
                        color="secondary"
                        endIcon={<OpenIcon open={networkSelectionOpen} />}
                        onClick={openNetworkSelection}
                    >
                        All networks
                    </Button>
                    <NetworkSelectionFilter
                        open={networkSelectionOpen}
                        anchorEl={networkSelectionRef.current}
                        onClose={closeNetworkSelection}
                    />
                </Stack>
            </Stack>

            {(!hasContent && !isLoading) && (
                <Stack gap={4}>
                    <ScheduledWrapEmptyCard />
                </Stack>
            )}

            <Stack gap={2}>
                {activeNetworks.map((network) => (
                    <ScheduledWrapTable
                        key={network.id}
                        address={address}
                        network={network}
                        fetchingCallback={fetchingCallback}
                    />
                ))}
                {isLoading || isWhitelistLoading && <ScheduledWrapLoadingTable />}
            </Stack>
        </>
    );
};

export default ScheduledWrapTables;
