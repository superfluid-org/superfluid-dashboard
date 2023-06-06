import {
  Button,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, useCallback, useMemo, useState } from "react";
import TokenAccessTable from "./TokenAccessTable";
import { useAvailableNetworks } from "../network/AvailableNetworksContext";
import TokenAccessLoadingTable from "./TokenAccessLoadingTable";
import { Add } from "@mui/icons-material";
import { AddOrModifyDialogBoundary } from "./dialogs/ModifyOrAddTokenAccessBoundary";

export interface FetchingStatus {
  isLoading: boolean;
  hasContent: boolean;
}

interface NetworkFetchingStatuses {
  [networkId: number]: FetchingStatus;
}

interface Props {
  address: Address;
}

const TokenAccessTables: FC<Props> = ({ address }) => {
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

  return !hasContent && !isLoading ? null : (
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
            Manage your Permissions and Allowances in one place.
          </Typography>
        </Stack>
        <AddOrModifyDialogBoundary initialFormValues={{}}>
          {({ openDialog }) => (
            <Button
              sx={{
                height: "40px",
              }}
              variant="contained"
              endIcon={<Add />}
              onClick={() => openDialog()}
            >
              Add
            </Button>
          )}
        </AddOrModifyDialogBoundary>
      </Stack>
      <Stack gap={4}>
        {availableNetworks.map((network) => (
          <TokenAccessTable
            key={network.id}
            address={address}
            network={network}
            fetchingCallback={fetchingCallback}
          />
        ))}
        {isLoading && <TokenAccessLoadingTable />}
      </Stack>
    </>
  );
};

export default TokenAccessTables;
