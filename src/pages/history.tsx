import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Container,
  Input,
  OutlinedInput,
  Paper,
  paperClasses,
  Stack,
  Table,
  TableBody,
  TableContainer,
  Typography,
} from "@mui/material";
import {
  AgreementLiquidatedByEvent,
  AllEvents,
  BurnedEvent,
  FlowUpdatedEvent,
  MintedEvent,
  TokenDowngradedEvent,
  TokenUpgradedEvent,
  TransferEvent,
} from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import groupBy from "lodash/fp/groupBy";
import { NextPage } from "next";
import { MouseEvent, useMemo, useState } from "react";
import EventHistoryRow from "../features/activityHistory/EventHistoryRow";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import {
  mainNetworks,
  Network,
  testNetworks,
} from "../features/network/networks";
import NetworkSelectionFilter, {
  NetworkStates,
} from "../features/network/NetworkSelectionFilter";
import { OpenIcon } from "../features/network/SelectNetwork";
import { subgraphApi } from "../features/redux/store";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";

type KeyEvent =
  | FlowUpdatedEvent
  | TokenDowngradedEvent
  | TokenUpgradedEvent
  | TransferEvent
  | AgreementLiquidatedByEvent;

type Activities = TokenDowngraded | TokenUpgraded | StreamLiquidated | Activity;

interface TokenDowngraded extends Activity<TokenDowngradedEvent> {
  transferEvent: TransferEvent;
  burnEvent: BurnedEvent;
}

interface TokenUpgraded extends Activity<TokenUpgradedEvent> {
  transferEvent: TransferEvent;
  mintEvent: MintedEvent;
}

interface StreamLiquidated extends Activity<AgreementLiquidatedByEvent> {
  flowUpdatedEvent: FlowUpdatedEvent;
}

interface Activity<T = KeyEvent> {
  keyEvent: T;
}

const mapKeyEvents = (events: AllEvents): Array<Activity> => {
  return allEvents.reduce((activities, currentEvent, index, events) => {}, []);
};

const buildNetworkStates = (
  networkList: Array<Network>,
  defaultActive: boolean
) =>
  networkList.reduce(
    (activeStates, network) => ({
      ...activeStates,
      [network.id]: defaultActive,
    }),
    {}
  );

const History: NextPage = () => {
  const { network } = useExpectedNetwork();
  const { visibleAddress = "" } = useVisibleAddress();
  const { testnet } = network;

  const [networkSelectionAnchor, setNetworkSelectionAnchor] =
    useState<HTMLButtonElement | null>(null);
  const [transactionSelectionAnchor, setTransactionSelectionAnchor] =
    useState<HTMLButtonElement | null>(null);

  const [showTestnets, setShowTestnets] = useState(!!testnet);

  const [networkStates, setNetworkStates] = useState<NetworkStates>({
    ...buildNetworkStates(mainNetworks, !showTestnets),
    ...buildNetworkStates(testNetworks, showTestnets),
  });

  const eventsQuery = subgraphApi.useEventsQuery({
    chainId: network.id,
    filter: {
      addresses_contains: [visibleAddress.toLowerCase()],
    },
    pagination: {
      take: 100,
      skip: 0,
    },
    order: {
      orderBy: "order",
      orderDirection: "desc",
    },
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

  const openNetworkSelection = (event: MouseEvent<HTMLButtonElement>) =>
    setNetworkSelectionAnchor(event.currentTarget);
  const closeNetworkSelection = () => setNetworkSelectionAnchor(null);

  const openTransactionSelection = (event: MouseEvent<HTMLButtonElement>) =>
    setTransactionSelectionAnchor(event.currentTarget);

  const closeTransactionSelection = () => setTransactionSelectionAnchor(null);

  const eventGroups = useMemo(
    () =>
      groupBy(
        (event) => format(new Date(event.timestamp * 1000), "yyyy-MM-dd"),
        eventsQuery.data?.items || []
      ),
    [eventsQuery.data]
  );

  return (
    <Container maxWidth="lg">
      <Stack gap={4.5}>
        <Typography variant="h3">Activity History</Typography>

        <Stack gap={2.5}>
          <Stack direction="row" justifyContent="space-between">
            <OutlinedInput
              fullWidth
              startAdornment={<SearchIcon />}
              placeholder="Filter by address, event, protocol, token etc."
              sx={{
                maxWidth: "460px",
                // backgroundColor: "background.paper",
              }}
            />
            <Input placeholder="11 June 2022 - 26 May 2022" />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Button
              variant="outlined"
              color="secondary"
              endIcon={<OpenIcon open={!!transactionSelectionAnchor} />}
              onClick={openTransactionSelection}
            >
              Transaction Type
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              endIcon={<OpenIcon open={!!networkSelectionAnchor} />}
              onClick={openNetworkSelection}
            >
              All networks
            </Button>
            <NetworkSelectionFilter
              open={!!networkSelectionAnchor}
              networkStates={networkStates}
              anchorEl={networkSelectionAnchor}
              showTestnets={showTestnets}
              onNetworkChange={onNetworkChange}
              onTestnetsChange={onTestnetsChange}
              onClose={closeNetworkSelection}
            />
          </Stack>
        </Stack>

        {Object.entries(eventGroups).map(([dateKey, events]) => (
          <Box key={dateKey}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {format(new Date(dateKey), "MMMM d, yyyy")}
            </Typography>
            <TableContainer>
              <Table>
                <TableBody>
                  {events.map((event) => (
                    <EventHistoryRow
                      key={event.id}
                      event={event}
                      network={network}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ))}
      </Stack>
    </Container>
  );
};

export default History;
