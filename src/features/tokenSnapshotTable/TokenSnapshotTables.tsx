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
import FaucetCard from "../faucet/FaucetCard";
import { useActiveNetworks } from "../network/ActiveNetworksContext";
import NetworkSelectionFilter from "../network/NetworkSelectionFilter";
import TokenSnapshotEmptyCard from "./TokenSnapshotEmptyCard";
import TokenSnapshotLoadingTable from "./TokenSnapshotLoadingTable";
import TokenSnapshotTable from "./TokenSnapshotTable";

export interface FetchingStatus {
  isLoading: boolean;
  hasContent: boolean;
}

export interface NetworkFetchingStatuses {
  [networkId: number]: FetchingStatus;
}

interface TokenSnapshotTablesProps {
  address: Address;
}

const TokenSnapshotTables: FC<TokenSnapshotTablesProps> = ({ address }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { activeNetworks } = useActiveNetworks();

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
    [setFetchingStatuses]
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
          Super Tokens
        </Typography>

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

      {!hasContent && !isLoading && (
        <Stack gap={4}>
          <TokenSnapshotEmptyCard />
          {/* <FaucetCard /> */}
        </Stack>
      )}

      <Stack gap={4}>
        {activeNetworks.map((network) => (
          <TokenSnapshotTable
            key={network.id}
            address={address}
            network={network}
            fetchingCallback={fetchingCallback}
          />
        ))}
        {isLoading && <TokenSnapshotLoadingTable />}
      </Stack>
    </>
  );
};

export default TokenSnapshotTables;
