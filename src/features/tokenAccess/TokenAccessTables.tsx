import {
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, useCallback, useMemo, useState } from "react";
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
    description="You currently don’t have any Super Token permissions and allowance set."
  />
);

const TokenAccessTables: FC<{}> = () => {
  const { visibleAddress } = useVisibleAddress();

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { availableNetworks: availableNetworks_ } = useAvailableNetworks();
  const { network: expectedNetwork } = useExpectedNetwork();
  const availableNetworks = useMemo(
    () => [
      ...availableNetworks_.filter((x) => x === expectedNetwork), // Order the current network first.
      ...availableNetworks_.filter((x) => x !== expectedNetwork),
    ],
    [availableNetworks_, expectedNetwork]
  );

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
      availableNetworks.some(
        (network) => fetchingStatuses[network.id]?.hasContent
      ),
    [availableNetworks, fetchingStatuses]
  );

  const isLoading = useMemo(
    () =>
      availableNetworks.some(
        (network) => fetchingStatuses[network.id]?.isLoading !== false
      ),
    [availableNetworks, fetchingStatuses]
  );

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
      {!hasContent && !isLoading ? (
        <EmptyCard />
      ) : (
        <Stack gap={4}>
          {visibleAddress &&
            availableNetworks.map((network) => (
              <TokenAccessTable
                key={network.id}
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
