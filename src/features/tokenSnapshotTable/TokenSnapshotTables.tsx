import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Button, Stack, Typography } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useNetworkContext } from "../network/NetworkContext";
import {
  mainNetworks,
  Network,
  networks,
  testNetworks,
} from "../network/networks";
import NetworkSelectionFilter, {
  NetworkStates,
} from "../network/NetworkSelectionFilter";
import { OpenIcon } from "../network/SelectNetwork";
import { subgraphApi } from "../redux/store";
import TokenSnapshotEmptyCard from "./TokenSnapshotEmptyCard";
import TokenSnapshotLoadingTable from "./TokenSnapshotLoadingTable";
import TokenSnapshotTable from "./TokenSnapshotTable";

const buildNetworkStates = (
  networkList: Array<Network>,
  defaultActive: boolean
) =>
  networkList.reduce(
    (activeStates, network) => ({
      ...activeStates,
      [network.chainId]: defaultActive,
    }),
    {}
  );

interface TokenSnapshotTablesProps {
  address: Address;
}

const TokenSnapshotTables: FC<TokenSnapshotTablesProps> = ({ address }) => {
  const {
    network: { isTestnet },
  } = useNetworkContext();

  const networkSelectionRef = useRef<HTMLButtonElement>(null);
  const [hasContent, setHasContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [tokenSnapshotsQueryTrigger] =
    subgraphApi.useLazyAccountTokenSnapshotsQuery();

  const [showTestnets, setShowTestnets] = useState(isTestnet);

  const [networkStates, setNetworkStates] = useState<NetworkStates>({
    ...buildNetworkStates(mainNetworks, !showTestnets),
    ...buildNetworkStates(testNetworks, showTestnets),
  });

  const onTestnetsChange = (testActive: boolean) => {
    setShowTestnets(testActive);
    setTimeout(
      () =>
        setNetworkStates({
          ...buildNetworkStates(testNetworks, testActive),
          ...buildNetworkStates(mainNetworks, !testActive),
        }),
      200
    );
  };

  const onNetworkChange = (chainId: number, active: boolean) =>
    setNetworkStates({ ...networkStates, [chainId]: active });

  const [networkSelectionOpen, setNetworkSelectionOpen] = useState(false);

  const openNetworkSelection = () => setNetworkSelectionOpen(true);
  const closeNetworkSelection = () => setNetworkSelectionOpen(false);

  const activeNetworks = useMemo(
    () => networks.filter((network) => networkStates[network.chainId]),
    [networkStates]
  );

  useEffect(() => {
    setHasContent(false);
    setIsLoading(true);

    Promise.all(
      activeNetworks.map(async (n) => {
        const result = await tokenSnapshotsQueryTrigger(
          {
            chainId: n.chainId,
            filter: {
              account: address,
            },
            pagination: {
              take: Infinity,
              skip: 0,
            },
          },
          true
        );

        if ((result.data?.items || []).length > 0) setHasContent(true);
      })
    ).then(() => {
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, activeNetworks]);

  //   if (hasContent === undefined) return <div>LOADING</div>;
  //   if (!hasContent) return <TokenSnapshotEmptyCard />;

  return (
    <>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h4" component="h1">
          Super Tokens
        </Typography>

        <Button
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
          networkStates={networkStates}
          anchorEl={networkSelectionRef.current}
          showTestnets={showTestnets}
          onNetworkChange={onNetworkChange}
          onTestnetsChange={onTestnetsChange}
          onClose={closeNetworkSelection}
        />
      </Stack>

      {!hasContent &&
        (isLoading ? (
          <TokenSnapshotLoadingTable />
        ) : (
          <TokenSnapshotEmptyCard />
        ))}

      {hasContent && (
        <Stack gap={4}>
          {activeNetworks.map((network) => (
            <TokenSnapshotTable
              key={network.chainId}
              address={address}
              network={network}
            />
          ))}
        </Stack>
      )}
    </>
  );
};

export default TokenSnapshotTables;
