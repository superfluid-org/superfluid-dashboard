import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Button, Container, Stack, Typography } from "@mui/material";
import type { NextPage } from "next";
import { useRef, useState } from "react";
import {
  mainNetworks,
  Network,
  networks,
  testNetworks,
} from "../features/network/networks";
import NetworkSelectionFilter, {
  NetworkStates,
} from "../features/network/NetworkSelectionFilter";
import TokenSnapshotTable from "../features/tokenSnapshotTable/TokenSnapshotTable";
import { useWalletContext } from "../features/wallet/WalletContext";

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

const Home: NextPage = () => {
  const { walletAddress } = useWalletContext();

  const networkSelectionRef = useRef<HTMLButtonElement>(null);

  const [showTestnets, setShowTestnets] = useState(false);

  const [networkStates, setNetworkStates] = useState<NetworkStates>({
    ...buildNetworkStates(mainNetworks, true),
    ...buildNetworkStates(testNetworks, false),
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

  if (!walletAddress) return <Container maxWidth="lg">EMPTY VIEW</Container>;

  return (
    <Container maxWidth="lg">
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
          endIcon={<KeyboardArrowDownIcon />}
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

      <Stack gap={4}>
        {networks
          .filter((network) => networkStates[network.chainId])
          .map((network) => (
            <TokenSnapshotTable
              key={network.chainId}
              address={walletAddress}
              network={network}
            />
          ))}
      </Stack>
    </Container>
  );
};

export default Home;
