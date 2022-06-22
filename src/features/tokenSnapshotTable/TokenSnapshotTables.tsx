import { Button, Stack, Typography } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, useEffect, useRef, useState } from "react";
import { useActiveNetworks } from "../network/ActiveNetworksContext";
import NetworkSelectionFilter from "../network/NetworkSelectionFilter";
import { OpenIcon } from "../network/SelectNetwork";
import { subgraphApi } from "../redux/store";
import TokenSnapshotEmptyCard from "./TokenSnapshotEmptyCard";
import TokenSnapshotLoadingTable from "./TokenSnapshotLoadingTable";
import TokenSnapshotTable from "./TokenSnapshotTable";

interface TokenSnapshotTablesProps {
  address: Address;
}

const TokenSnapshotTables: FC<TokenSnapshotTablesProps> = ({ address }) => {
  const [hasContent, setHasContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenSnapshotsQueryTrigger] =
    subgraphApi.useLazyAccountTokenSnapshotsQuery();
  const { activeNetworks } = useActiveNetworks();

  const networkSelectionRef = useRef<HTMLButtonElement>(null);

  const [networkSelectionOpen, setNetworkSelectionOpen] = useState(false);

  const openNetworkSelection = () => setNetworkSelectionOpen(true);
  const closeNetworkSelection = () => setNetworkSelectionOpen(false);

  useEffect(() => {
    setHasContent(false);
    setIsLoading(true);

    Promise.all(
      activeNetworks.map(async (n) => {
        const result = await tokenSnapshotsQueryTrigger(
          {
            chainId: n.id,
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
              key={network.id}
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
