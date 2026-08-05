import {
  Button,
  FormControlLabel,
  Stack,
  Switch,
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
import ERC20BalanceTable from "./ERC20BalanceTable";

export interface FetchingStatus {
  isLoading: boolean;
  hasContent: boolean;
}

export interface NetworkFetchingStatuses {
  [key: string]: FetchingStatus;
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
  const [showERC20s, setShowERC20s] = useState(false);

  const openNetworkSelection = () => setNetworkSelectionOpen(true);
  const closeNetworkSelection = () => setNetworkSelectionOpen(false);

  const superTokenFetchingCallback = useCallback(
    (networkId: number, fetchingStatus: FetchingStatus) =>
      setFetchingStatuses((currentStatuses) => ({
        ...currentStatuses,
        [`super-${networkId}`]: fetchingStatus,
      })),
    [setFetchingStatuses]
  );

  const erc20FetchingCallback = useCallback(
    (networkId: number, fetchingStatus: FetchingStatus) =>
      setFetchingStatuses((currentStatuses) => ({
        ...currentStatuses,
        [`erc20-${networkId}`]: fetchingStatus,
      })),
    [setFetchingStatuses]
  );

  const hasContent = useMemo(
    () =>
      activeNetworks.some(
        ({ id }) =>
          fetchingStatuses[`super-${id}`]?.hasContent ||
          (showERC20s && fetchingStatuses[`erc20-${id}`]?.hasContent)
      ),
    [activeNetworks, fetchingStatuses, showERC20s]
  );

  const isLoading = useMemo(
    () =>
      activeNetworks.some(
        ({ id }) =>
          fetchingStatuses[`super-${id}`]?.isLoading !== false ||
          (showERC20s && fetchingStatuses[`erc20-${id}`]?.isLoading !== false)
      ),
    [activeNetworks, fetchingStatuses, showERC20s]
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
          Portfolio
        </Typography>

        <Stack direction="row" alignItems="center" gap={{ xs: 1, sm: 2 }}>
          <FormControlLabel
            sx={{ mr: 0 }}
            label={isBelowMd ? "ERC-20s" : "Show ERC-20s"}
            control={
              <Switch
                data-cy="show-erc20-tokens"
                checked={showERC20s}
                onChange={(_, checked) => setShowERC20s(checked)}
              />
            }
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
        </Stack>
        <NetworkSelectionFilter
          open={networkSelectionOpen}
          anchorEl={networkSelectionRef.current}
          onClose={closeNetworkSelection}
        />
      </Stack>

      {!hasContent && !isLoading && (
        <Stack gap={4}>
          <TokenSnapshotEmptyCard includesERC20s={showERC20s} />
          {/* <FaucetCard /> */}
        </Stack>
      )}

      <Stack gap={4}>
        {activeNetworks.map((network) => (
          <TokenSnapshotTable
            key={network.id}
            address={address}
            network={network}
            fetchingCallback={superTokenFetchingCallback}
          />
        ))}
        {showERC20s &&
          activeNetworks.map((network) => (
            <ERC20BalanceTable
              key={`erc20-${network.id}`}
              address={address}
              network={network}
              fetchingCallback={erc20FetchingCallback}
            />
          ))}
        {isLoading && <TokenSnapshotLoadingTable />}
      </Stack>
    </>
  );
};

export default TokenSnapshotTables;
