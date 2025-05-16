import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import TokenAccessTable from "./TokenAccessTable";
import { useAvailableNetworks } from "../network/AvailableNetworksContext";
import { UpsertTokenAccessButton } from "./TokenAccessRow";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import NoContentPaper from "../../components/NoContent/NoContentPaper";

export interface FetchingStatus {
  isLoading: boolean;
  hasContent: boolean;
}

interface NetworkFetchingStatuses {
  [networkId: number]: FetchingStatus;
}

const EmptyCard: FC<{}> = ({}) => (
  <NoContentPaper
    dataCy={"no-access-data"}
    title="No Access Data"
    description="You currently don't have any Super Token permissions and allowance set."
  />
);

const TokenAccessTables: FC<{}> = () => {
  const { visibleAddress } = useVisibleAddress();

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { availableNetworks: availableNetworks_ } = useAvailableNetworks();
  const { network: expectedNetwork } = useExpectedNetwork();

  // Always prioritize the current network in the list
  const availableNetworks = useMemo(
    () => [
      ...availableNetworks_.filter((x) => x === expectedNetwork), // Order the current network first.
      ...availableNetworks_.filter((x) => x !== expectedNetwork),
    ],
    [availableNetworks_, expectedNetwork]
  );

  const [fetchingStatuses, setFetchingStatuses] =
    useState<NetworkFetchingStatuses>({});
  const [hasInitializedNetworks, setHasInitializedNetworks] = useState(false);

  // Setup initial loading state for all networks
  useEffect(() => {
    if (availableNetworks.length > 0 && !hasInitializedNetworks) {
      const initialStatuses: NetworkFetchingStatuses = {};
      availableNetworks.forEach((network) => {
        initialStatuses[network.id] = { isLoading: true, hasContent: false };
      });
      setFetchingStatuses(initialStatuses);
      setHasInitializedNetworks(true);
    }
  }, [availableNetworks, hasInitializedNetworks]);

  const fetchingCallback = useCallback(
    (networkId: number, fetchingStatus: FetchingStatus) => {
      setFetchingStatuses((currentStatuses) => {
        const newStatus = {
          ...currentStatuses,
          [networkId]: fetchingStatus,
        };
        console.log(
          `Fetching status update for network ${networkId}:`,
          fetchingStatus
        );
        console.log("All fetching statuses:", newStatus);
        return newStatus;
      });
    },
    [setFetchingStatuses]
  );

  // Check if at least one network has content
  const hasContent = useMemo(
    () =>
      availableNetworks.some(
        (network) => fetchingStatuses[network.id]?.hasContent
      ),
    [availableNetworks, fetchingStatuses]
  );

  // Check if any network is still loading
  const isLoading = useMemo(
    () =>
      !hasInitializedNetworks ||
      availableNetworks.some(
        (network) => fetchingStatuses[network.id]?.isLoading !== false
      ),
    [availableNetworks, fetchingStatuses, hasInitializedNetworks]
  );

  // Only show "No Access Data" when we're sure there's no content and we're not loading
  const showEmptyState = !hasContent && !isLoading && hasInitializedNetworks;

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems={"center"}
      >
        <Stack direction="column">
          <Typography variant={isBelowMd ? "h3" : "h4"} component="h1">
            Approvals
          </Typography>
          <Typography variant="body1" color="secondary">
            Manage your Super Token permissions and allowances in one place.
          </Typography>
        </Stack>
        <UpsertTokenAccessButton
          dataCy={"token-access-global-button"}
          initialFormValues={{
            network: expectedNetwork,
          }}
        />
      </Stack>
      {showEmptyState ? (
        <EmptyCard />
      ) : (
        <Stack gap={4}>
          {visibleAddress &&
            availableNetworks.map((network) => (
              <TokenAccessTable
                key={`${network.id}-${visibleAddress}`}
                address={visibleAddress}
                network={network}
                fetchingCallback={fetchingCallback}
              />
            ))}
        </Stack>
      )}
    </>
  );
};

export default TokenAccessTables;
