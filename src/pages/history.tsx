import DateRangeIcon from "@mui/icons-material/DateRange";
import {
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { add, endOfDay, format, startOfDay, startOfMonth } from "date-fns";
import flatten from "lodash/fp/flatten";
import groupBy from "lodash/fp/groupBy";
import orderBy from "lodash/fp/orderBy";
import { NextPage } from "next";
import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import OpenIcon from "../components/OpenIcon/OpenIcon";
import ActivityRow from "../features/activityHistory/ActivityRow";
import ActivityTypeFilter, {
  ActivityType,
  ActivityTypeFilters,
  AllActivityTypes,
} from "../features/activityHistory/ActivityTypeFilter";
import LoadingActivityGroup from "../features/activityHistory/LoadingActivityGroup";
import DatePicker from "../components/DatePicker/DatePicker";
import { useActiveNetworks } from "../features/network/ActiveNetworksContext";
import NetworkSelectionFilter from "../features/network/NetworkSelectionFilter";
import { subgraphApi } from "../features/redux/store";
import AddressSearch from "../features/send/AddressSearch";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";
import { Activity, mapActivitiesFromEvents } from "../utils/activityUtils";

const History: NextPage = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const dateNow = useMemo(() => new Date(), []);

  const { visibleAddress = "" } = useVisibleAddress();
  const { activeNetworks } = useActiveNetworks();

  const [activitySelectionAnchor, setActivitySelectionAnchor] =
    useState<HTMLButtonElement | null>(null);
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLElement | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const [networkSelectionAnchor, setNetworkSelectionAnchor] =
    useState<HTMLButtonElement | null>(null);

  const [activeActivityTypes, setActiveActivityTypes] =
    useState(AllActivityTypes);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [startDate, setStartDate] = useState(add(dateNow, { months: -1 }));
  const [endDate, setEndDate] = useState(endOfDay(dateNow));

  const [searchedAddress, setAddressSearch] = useState<string | null>(null);

  const [eventsQueryTrigger] = subgraphApi.useLazyEventsQuery();

  useEffect(() => {
    if (visibleAddress) {
      setIsLoading(true);

      Promise.all(
        activeNetworks.map((network) =>
          eventsQueryTrigger(
            {
              chainId: network.id,
              filter: {
                addresses_contains: searchedAddress
                  ? [
                      visibleAddress.toLowerCase(),
                      searchedAddress.toLowerCase(),
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
  }, [visibleAddress, activeNetworks, startDate, endDate, searchedAddress]);

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
      <Stack gap={isBelowMd ? 2.5 : 4.5}>
        <Typography variant="h3">Activity History</Typography>

        <Stack gap={2.5}>
          <Stack direction="row" justifyContent="space-between" gap={2}>
            <AddressSearch
              address={searchedAddress}
              placeholder="Filter by address or ENS"
              onChange={setAddressSearch}
              addressLength="medium"
              ButtonProps={{
                variant: "outlined",
                color: "secondary",
                size: "large",
                sx: {
                  maxWidth: "420px",
                  flex: 1,
                  justifyContent: "flex-start",
                  ".MuiButton-endIcon": {
                    marginLeft: "auto",
                  },
                  [theme.breakpoints.up("md")]: {
                    height: "52px",
                  },
                  [theme.breakpoints.down("md")]: {
                    ...theme.typography.body2,
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
              sx={{
                [theme.breakpoints.down("md")]: {
                  p: 1,
                  ".MuiButton-startIcon": { m: 0 },
                },
              }}
            >
              {!isBelowMd &&
                `${format(startDate, "d MMMM yyyy")} - ${format(
                  endDate,
                  "d MMMM yyyy"
                )}`}
            </Button>
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
              anchorEl={networkSelectionAnchor}
              onClose={closeNetworkSelection}
            />
          </Stack>
        </Stack>

        {isLoading && <LoadingActivityGroup />}
        {!isLoading && !hasContent && (
          <Paper
            elevation={1}
            sx={{
              px: 4,
              py: 7,
              [theme.breakpoints.down("md")]: {
                px: 2,
                py: 3,
              },
            }}
          >
            <Typography variant={isBelowMd ? "h5" : "h4"} textAlign="center">
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
                <TableContainer
                  sx={{
                    [theme.breakpoints.down("md")]: {
                      borderLeft: 0,
                      borderRight: 0,
                      borderRadius: 0,
                      boxShadow: "none",
                      mx: -2,
                      width: "auto",
                    },
                  }}
                >
                  <Table
                    sx={{
                      // TODO: Make all table layouts fixed
                      [theme.breakpoints.up("md")]: {
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
