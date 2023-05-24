import { Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, useCallback, useMemo, useState } from "react";
import PermissionAndAllowancesTable from "./PermissionAndAllowancesTable";
import { useAvailableNetworks } from "../network/AvailableNetworksContext";
import PermissionAndAllowancesLoadingTable from "./PermissionAndAllowancesLoadingTable";

export interface FetchingStatus {
  isLoading: boolean;
  hasContent: boolean;
}

interface NetworkFetchingStatuses {
  [networkId: number]: FetchingStatus;
}

interface PermissionAndAllowancesTablesProps {
  address: Address;
}

const PermissionAndAllowancesTables: FC<PermissionAndAllowancesTablesProps> = ({
  address,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { availableNetworks } = useAvailableNetworks();
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
      <Stack direction="column" gap={1}>
        <Typography variant={isBelowMd ? "h3" : "h4"} component="h1">
          Permissions & Allowances
        </Typography>
        <Typography variant="body1" color="secondary">
          Manage your Permissions and Allowances in one place.
        </Typography>
      </Stack>
      {!hasContent && !isLoading && (
        <Stack gap={4}>{/* <PermissionAndAllowancesEmptyCard /> */}</Stack>
      )}
      <Stack gap={4}>
        {availableNetworks.map((network) => (
          <PermissionAndAllowancesTable
            key={network.id}
            address={address}
            network={network}
            fetchingCallback={fetchingCallback}
          />
        ))}
        {isLoading && <PermissionAndAllowancesLoadingTable />}
      </Stack>
    </>
  );
};

export default PermissionAndAllowancesTables;
