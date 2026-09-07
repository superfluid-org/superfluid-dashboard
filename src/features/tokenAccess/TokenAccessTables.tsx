import {
  Button,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, useCallback, useMemo, useRef, useState } from "react";
import { TokenAccessTable } from "./TokenAccessTable";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import { useActiveNetworks } from "../network/ActiveNetworksContext";
import NetworkSelectionFilter from "../network/NetworkSelectionFilter";
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

const EmptyCard: FC<{}> = ({ }) => (
  <NoContentPaper
    dataCy={"no-access-data"}
    title="No Access Data"
    description="You currently don’t have any Super Token permissions and allowance set."
  />
);

export function TokenAccessTables() {
  const { visibleAddress } = useVisibleAddress();

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { activeNetworks } = useActiveNetworks();
  const { network: expectedNetwork } = useExpectedNetwork();

  const networkSelectionRef = useRef<HTMLButtonElement>(null);
  const [networkSelectionOpen, setNetworkSelectionOpen] = useState(false);

  const openNetworkSelection = () => setNetworkSelectionOpen(true);
  const closeNetworkSelection = () => setNetworkSelectionOpen(false);

  const [fetchingStatuses, setFetchingStatuses] =
    useState<NetworkFetchingStatuses>({});

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
      activeNetworks.some(
        (network) => fetchingStatuses[network.id]?.hasContent
      ),
    [activeNetworks, fetchingStatuses]
  );

  const isLoading = useMemo(
    () =>
      activeNetworks.some(
        (network) => fetchingStatuses[network.id]?.isLoading !== false
      ),
    [activeNetworks, fetchingStatuses]
  );

  const showEmptyCard = !hasContent && !isLoading;

  return (
    <>
      <Stack
        direction="row"
        sx={{
          justifyContent: "space-between",
          alignItems: "center"
        }}>
        <Stack direction="column">
          <Typography variant={isBelowMd ? "h3" : "h4"} component="h1">
            Approvals
          </Typography>
          <Typography variant="body1" color="secondary">
            Manage your Super Token permissions and allowances in one place.
          </Typography>
        </Stack>
        <Stack direction="row" sx={{
          gap: 1.5
        }}>
          <UpsertTokenAccessButton
            dataCy={"token-access-global-button"}
            initialFormValues={{
              network: expectedNetwork,
            }}
          />
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
      {showEmptyCard && <EmptyCard />}
      {
        visibleAddress && activeNetworks.map((network) => (
          <TokenAccessTable
            key={`${network.id}-${visibleAddress}`}
            address={visibleAddress!}
            network={network}
            fetchingCallback={fetchingCallback}
          />
        ))
      }
    </>
  );
};
