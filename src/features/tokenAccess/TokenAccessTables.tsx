import {
  Box,
  Card,
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

export interface FetchingStatus {
  isLoading: boolean;
  hasContent: boolean;
}

interface NetworkFetchingStatuses {
  [networkId: number]: FetchingStatus;
}

const EmptyCard: FC<{}> = ({}) => (
  <Card
    sx={{ py: 4, textAlign: "center" }}
    component={Stack}
    gap={3}
    alignItems="center"
  >
    <Box>
      <Typography data-cy={"no-scheduled-wrap-message"} variant="h5">
        Nothing to see here
      </Typography>
      <Typography>You currently don’t have any ACL permissions set</Typography>
    </Box>
    <UpsertTokenAccessButton initialFormValues={{}} />
  </Card>
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
    []
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
            Permissions & Allowances
          </Typography>
          <Typography variant="body1" color="secondary">
            Manage your permissions and allowances in one place.
          </Typography>
        </Stack>
        <UpsertTokenAccessButton initialFormValues={{}} />
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
