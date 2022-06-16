import CloseIcon from "@mui/icons-material/Close";
import DateRangeIcon from "@mui/icons-material/DateRange";
import SearchIcon from "@mui/icons-material/Search";
import {
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableContainer,
  Typography,
} from "@mui/material";
import { endOfDay, format, startOfDay, startOfMonth } from "date-fns";
import flatten from "lodash/fp/flatten";
import groupBy from "lodash/fp/groupBy";
import orderBy from "lodash/fp/orderBy";
import { NextPage } from "next";
import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import Blockies from "react-blockies";
import ActivityRow from "../features/activityHistory/ActivityRow";
import ActivityTypeFilter, {
  ActivityType,
  ActivityTypeFilters,
  AllActivityTypes,
} from "../features/activityHistory/ActivityTypeFilter";
import LoadingActivityGroup from "../features/activityHistory/LoadingActivityGroup";
import DatePicker from "../features/common/DatePicker";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import {
  mainNetworks,
  networks,
  testNetworks,
} from "../features/network/networks";
import NetworkSelectionFilter, {
  buildNetworkStates,
  NetworkStates,
} from "../features/network/NetworkSelectionFilter";
import { OpenIcon } from "../features/network/SelectNetwork";
import { subgraphApi } from "../features/redux/store";
import AddressSearch from "../features/send/AddressSearch";
import AddressSearchDialog from "../features/send/AddressSearchDialog";
import { DisplayAddress } from "../features/send/DisplayAddressChip";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";
import { Activity, mapActivitiesFromEvents } from "../utils/activityUtils";
import shortenAddress from "../utils/shortenAddress";

const History: NextPage = () => {
  const dateNow = useMemo(() => new Date(), []);

  const { visibleAddress = "" } = useVisibleAddress();
  const {
    network: { testnet },
  } = useExpectedNetwork();

  const [networkSelectionAnchor, setNetworkSelectionAnchor] =
    useState<HTMLButtonElement | null>(null);
  const [activitySelectionAnchor, setActivitySelectionAnchor] =
    useState<HTMLButtonElement | null>(null);
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLElement | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showTestnets, setShowTestnets] = useState(!!testnet);
  const [networkStates, setNetworkStates] = useState<NetworkStates>({
    ...buildNetworkStates(mainNetworks, !showTestnets),
    ...buildNetworkStates(testNetworks, showTestnets),
  });
  const [activeActivityTypes, setActiveActivityTypes] =
    useState(AllActivityTypes);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [startDate, setStartDate] = useState(startOfMonth(dateNow));
  const [endDate, setEndDate] = useState(endOfDay(dateNow));

  const [addressSearchOpen, setAddressSearchOpen] = useState(false);

  const [addressSearch, setAddressSearch] = useState<DisplayAddress | null>(
    null
  );

  const [eventsQueryTrigger] = subgraphApi.useLazyEventsQuery();

  const activeNetworks = useMemo(
    () => networks.filter((network) => networkStates[network.id]),
    [networkStates]
  );

  useEffect(() => {
    if (visibleAddress) {
      setIsLoading(true);

      Promise.all(
        activeNetworks.map((network) =>
          eventsQueryTrigger(
            {
              chainId: network.id,
              filter: {
                addresses_contains: addressSearch
                  ? [
                      visibleAddress.toLowerCase(),
                      addressSearch.hash.toLowerCase(),
                    ]
                  : [visibleAddress.toLowerCase()],
                timestamp_gte: Math.floor(
                  startOfDay(startDate).getTime() / 1000
                ).toString(),
                timestamp_lte: Math.floor(
                  endOfDay(endDate).getTime() / 1000
                ).toString(),
              },
              pagination: {
                take: 100,
                skip: 0,
              },
              order: {
                orderBy: "order",
                orderDirection: "desc",
              },
            },
            true
          ).then((result) =>
            mapActivitiesFromEvents(result.data?.items || [], network)
          )
        )
      ).then((results) => {
        setActivities(
          orderBy(
            (activity) => activity.keyEvent.timestamp,
            "desc",
            flatten(results)
          )
        );

        setIsLoading(false);
      });
    } else {
      setActivities([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleAddress, activeNetworks, startDate, endDate, addressSearch]);

  const onAddressSearchChange = (address: DisplayAddress) => {
    setAddressSearch(address);
    closeAddressSearchDialog();
  };

  const openAddressSearchDialog = () => setAddressSearchOpen(true);
  const closeAddressSearchDialog = () => setAddressSearchOpen(false);

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

  const openActivitySelection = (event: MouseEvent<HTMLButtonElement>) =>
    setActivitySelectionAnchor(event.currentTarget);
  const closeActivitySelection = () => setActivitySelectionAnchor(null);

  const openDatePicker = (event: MouseEvent<HTMLElement>) =>
    setDatePickerAnchor(event.currentTarget);
  const closeDatePicker = () => setDatePickerAnchor(null);

  const onDateRangeChange = (startDate: Date, endDate: Date) => {
    setStartDate(startDate);
    setEndDate(endDate);
  };

  const onActivityTypesChange = (enabledActivityTypes: Array<ActivityType>) => {
    setActiveActivityTypes(enabledActivityTypes);
  };

  const activeTypeFilters = useMemo(() => {
    return ActivityTypeFilters.filter((typeFilter) =>
      activeActivityTypes.includes(typeFilter.key)
    );
  }, [activeActivityTypes]);

  const validateActivityFilters = useCallback(
    (activity: Activity) => {
      return activeTypeFilters.some(({ filter }) =>
        filter(activity.keyEvent, visibleAddress)
      );
    },
    [activeTypeFilters, visibleAddress]
  );

  const filteredActivitiesGroups = useMemo(() => {
    return groupBy(
      (activity) =>
        format(new Date(activity.keyEvent.timestamp * 1000), "yyyy-MM-dd"),
      activities.filter(validateActivityFilters)
    );
  }, [activities, validateActivityFilters]);

  const hasContent = useMemo(
    () => Object.keys(filteredActivitiesGroups).length > 0,
    [filteredActivitiesGroups]
  );

  return (
    <Container maxWidth="lg">
      <Stack gap={4.5}>
        <Typography variant="h3">Activity History</Typography>

        <Stack gap={2.5}>
          <Stack direction="row" justifyContent="space-between">
            <AddressSearch
              address={addressSearch}
              placeholder="Filter by public address or ENS"
              shortenAddr={12}
              onChange={setAddressSearch}
              ButtonProps={{
                variant: "outlined",
                color: "secondary",
                size: "large",
                sx: {
                  width: "420px",
                  height: "52px",
                  justifyContent: "flex-start",
                  ".MuiButton-endIcon": {
                    marginLeft: "auto",
                  },
                },
              }}
            />
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              startIcon={<DateRangeIcon />}
              onClick={openDatePicker}
            >{`${format(startDate, "d MMMM yyyy")} - ${format(
              endDate,
              "d MMMM yyyy"
            )}`}</Button>
            <DatePicker
              anchorEl={datePickerAnchor}
              maxDate={dateNow}
              startDate={startDate}
              endDate={endDate}
              onChange={onDateRangeChange}
              onClose={closeDatePicker}
            />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Button
              variant="outlined"
              color="secondary"
              endIcon={<OpenIcon open={!!activitySelectionAnchor} />}
              onClick={openActivitySelection}
            >
              Activity Type
            </Button>
            <ActivityTypeFilter
              anchorEl={activitySelectionAnchor}
              enabledActivities={activeActivityTypes}
              onChange={onActivityTypesChange}
              onClose={closeActivitySelection}
            />

            <Button
              variant="outlined"
              color="secondary"
              endIcon={<OpenIcon open={!!networkSelectionAnchor} />}
              onClick={openNetworkSelection}
            >
              All Networks
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

        {isLoading && <LoadingActivityGroup />}
        {!isLoading && !hasContent && (
          <Paper elevation={1} sx={{ px: 12, py: 7 }}>
            <Typography variant="h4" textAlign="center">
              No Activity History Available
            </Typography>
            <Typography color="text.secondary" textAlign="center">
              Transactions including wrapping tokens and sending streams will
              appear here.
            </Typography>
          </Paper>
        )}

        {!isLoading &&
          hasContent &&
          Object.entries(filteredActivitiesGroups).map(
            ([dateKey, activities]) => (
              <Box key={dateKey}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {format(new Date(dateKey), "MMMM d, yyyy")}
                </Typography>
                <TableContainer>
                  <Table
                    sx={{
                      // TODO: Make all table layouts fixed
                      tableLayout: "fixed",
                      td: {
                        "&:nth-of-type(1)": {
                          width: "30%",
                        },
                        "&:nth-of-type(2)": {
                          width: "30%",
                        },
                        "&:nth-of-type(3)": {
                          width: "30%",
                        },
                        "&:nth-of-type(4)": {
                          width: "140px",
                        },
                      },
                    }}
                  >
                    <TableBody>
                      {activities.map((activity) => (
                        <ActivityRow
                          key={activity.keyEvent.id}
                          activity={activity}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )
          )}
      </Stack>
    </Container>
  );
};

export default History;
