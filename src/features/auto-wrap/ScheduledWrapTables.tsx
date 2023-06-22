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
import ScheduledWrapApplyCard from "./ScheduledWrapApplyCard";
import {
  FetchingStatus,
  NetworkFetchingStatuses,
} from "../tokenSnapshotTable/TokenSnapshotTables";
import ScheduledWrapTable from "./ScheduledWrapTable";
import AutoWrapAddTokenButtonSection from "./AutoWrapAddTokenButtonSection";

interface ScheduledWrapTablesProps {
  address: Address;
}

export interface PlatformWhitelistedStatus {
  isLoading: boolean;
  isWhitelisted: boolean;
}

export interface PlatformWhitelistedStatuses {
  [networkId: number]: PlatformWhitelistedStatus;
}

const ScheduledWrapTables: FC<ScheduledWrapTablesProps> = ({ address }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { activeNetworks } = useActiveNetworks();

  const networkSelectionRef = useRef<HTMLButtonElement>(null);

  const [platformWhitelistedStatuses, setPlatformWhitelistedStatuses] =
    useState<PlatformWhitelistedStatuses>({});

  const [fetchingStatuses, setFetchingStatuses] =
    useState<NetworkFetchingStatuses>({});

  const [networkSelectionOpen, setNetworkSelectionOpen] = useState(false);

  const openNetworkSelection = () => setNetworkSelectionOpen(true);
  const closeNetworkSelection = () => setNetworkSelectionOpen(false);

  const whitelistedCallback = useCallback(
    (networkId: number, status: PlatformWhitelistedStatus) =>
      setPlatformWhitelistedStatuses((currentStatuses) => ({
        ...currentStatuses,
        [networkId]: status,
      })),
    []
  );

  const fetchingCallback = useCallback(
    (networkId: number, fetchingStatus: FetchingStatus) =>
      setFetchingStatuses((currentStatuses) => ({
        ...currentStatuses,
        [networkId]: fetchingStatus,
      })),
    []
  );

  const isPlatformWhitelisted = useMemo(
    () =>
      !!activeNetworks.some(
        (activeNetwork) =>
          platformWhitelistedStatuses[activeNetwork.id]?.isWhitelisted !== false
      ),
    [activeNetworks, platformWhitelistedStatuses]
  );

  const isWhitelistLoading = useMemo(
    () =>
      !!activeNetworks.some(
        (activeNetwork) =>
          platformWhitelistedStatuses[activeNetwork.id]?.isLoading !== false
      ),
    [activeNetworks, platformWhitelistedStatuses]
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
          Auto-Wrap
        </Typography>

        <Stack direction={"row"} gap={1.5}>
          {hasContent && (
            <AutoWrapAddTokenButtonSection
              platformWhitelistedStatuses={platformWhitelistedStatuses}
            />
          )}
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
      {!isLoading && !isWhitelistLoading && !isPlatformWhitelisted ? (
        <ScheduledWrapApplyCard />
      ) : !isLoading &&
        !isWhitelistLoading &&
        isPlatformWhitelisted &&
        !hasContent ? (
        <ScheduledWrapEmptyCard
          platformWhitelistedStatuses={platformWhitelistedStatuses}
        />
      ) : null}
      <Stack gap={2}>
        {activeNetworks.map((network) => (
          <ScheduledWrapTable
            key={network.id}
            address={address}
            network={network}
            fetchingCallback={fetchingCallback}
            whitelistedCallback={whitelistedCallback}
          />
        ))}
      </Stack>
    </>
  );
};

export default ScheduledWrapTables;
