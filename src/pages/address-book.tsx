import {
  Button,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { Address } from "@superfluid-finance/sdk-core";
import { NextPage } from "next";
import { parse, unparse } from "papaparse";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import AddressSearchDialog from "../components/AddressSearchDialog/AddressSearchDialog";
import DownloadButton from "../components/DownloadButton/DownloadButton";
import ReadFileButton from "../components/ReadFileButton/ReadFileButton";
import {
  addAddressBookEntries,
  addAddressBookEntry,
  AddressBookEntry,
  addressBookSelectors,
  removeAddressBookEntries,
} from "../features/addressBook/addressBook.slice";
import AddressBookMobileRow from "../features/addressBook/AddressBookMobileRow";
import AddressBookRow from "../features/addressBook/AddressBookRow";
import AddressFilter from "../features/addressBook/AddressFilter";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import {
  subgraphApi,
  useAppDispatch,
  useAppSelector,
} from "../features/redux/store";
import AddressSearchIndex from "../features/send/AddressSearchIndex";
import StreamActiveFilter, {
  StreamActiveType,
} from "../features/streamsTable/StreamActiveFilter";
import { getAddress } from "../utils/memoizedEthersUtils";

const AddressBook: NextPage = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { data: account } = useAccount();
  const accountAddress = account?.address;

  const { network } = useExpectedNetwork();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addressesFilter, setAddressesFilter] = useState<Address[]>([]);
  const [streamActiveFilter, setStreamActiveFilter] = useState(
    StreamActiveType.All
  );

  const addressBookEntries = useAppSelector((state) =>
    addressBookSelectors.selectAll(state.addressBook)
  );

  const incomingStreamsQuery = subgraphApi.useStreamsQuery(
    accountAddress
      ? {
          chainId: network.id,
          filter: {
            sender: accountAddress.toLowerCase(),
            currentFlowRate_gt: "0",
          },
          pagination: {
            take: Infinity,
            skip: 0,
          },
          order: {
            orderBy: "updatedAtTimestamp",
            orderDirection: "desc",
          },
        }
      : skipToken
  );

  const outgoingStreamsQuery = subgraphApi.useStreamsQuery(
    accountAddress
      ? {
          chainId: network.id,
          filter: {
            receiver: accountAddress.toLowerCase(),
            currentFlowRate_gt: "0",
          },
          pagination: {
            take: Infinity,
            skip: 0,
          },
          order: {
            orderBy: "updatedAtTimestamp",
            orderDirection: "desc",
          },
        }
      : skipToken
  );

  // Addresses filter

  const onAddressesFilterChange = (newAddressesFilter: Address[]) => {
    setAddressesFilter(newAddressesFilter);
    setPage(0);
  };

  // Stream active filter

  const onStreamActiveFilterChange = (filter: StreamActiveType) => {
    setStreamActiveFilter(filter);
    setPage(0);
  };

  // Adding new address

  const openAddDialog = () => setShowAddDialog(true);
  const closeAddDialog = () => setShowAddDialog(false);

  const onAddAddress = (address: Address) => {
    dispatch(
      addAddressBookEntry({
        address,
      })
    );
    closeAddDialog();
  };

  // Deleting addresses

  const setRowSelected = (address: Address) => (isSelected: boolean) => {
    setSelectedAddresses(
      selectedAddresses
        .filter((a) => a !== address)
        .concat(isSelected ? [address] : [])
    );
  };

  const startDeleting = () => setIsDeleting(true);

  const cancelDeleting = () => {
    setIsDeleting(false);
    setSelectedAddresses([]);
  };

  const deleteEntries = useCallback(() => {
    dispatch(removeAddressBookEntries(selectedAddresses));
    cancelDeleting();
  }, [selectedAddresses, dispatch]);

  // Pagination

  const handleChangePage = (_e: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Importing address book

  const onImport = async (file: File) => {
    try {
      const blob = new Blob([file], { type: "text/csv;charset=utf-8" });
      const contents = await blob.text();

      const { data: parsedCSV } = parse<{ NAME?: string; ADDRESS: string }>(
        contents,
        { header: true }
      );

      const mappedData: AddressBookEntry[] = parsedCSV.map((item) => ({
        name: item.NAME,
        address: getAddress(item.ADDRESS),
      }));

      insertImportedAddresses(mappedData);
    } catch (e) {
      console.error(
        "Someting went wrong while reading imported address book file.",
        e
      );
    }
  };

  const insertImportedAddresses = useCallback(
    (newEntries: AddressBookEntry[]) => {
      dispatch(
        addAddressBookEntries(
          newEntries.filter(
            (newEntry) =>
              !addressBookEntries.some(
                (existingEntry) =>
                  existingEntry.address.toLowerCase() ===
                  newEntry.address.toLowerCase()
              )
          )
        )
      );
    },
    [addressBookEntries, dispatch]
  );

  // Exporting address book

  const exportableAddressBookContent = useMemo(
    () =>
      unparse(
        addressBookEntries.map(({ address, name }) => ({
          ADDRESS: address,
          NAME: name,
        }))
      ),
    [addressBookEntries]
  );

  // Mapping and filtering

  const mappedEntries = useMemo(() => {
    const allStreams = (incomingStreamsQuery.data?.items || []).concat(
      outgoingStreamsQuery.data?.items || []
    );

    return addressBookEntries.map((entry) => {
      return {
        ...entry,
        streams: allStreams.filter((stream) =>
          [stream.sender.toLowerCase(), stream.receiver.toLowerCase()].includes(
            entry.address.toLowerCase()
          )
        ),
      };
    });
  }, [
    incomingStreamsQuery.data,
    outgoingStreamsQuery.data,
    addressBookEntries,
  ]);

  const filteredEntries = useMemo(() => {
    return mappedEntries
      .filter(
        (entry) =>
          addressesFilter.length === 0 ||
          addressesFilter.includes(entry.address)
      )
      .filter((entry) => {
        switch (streamActiveFilter) {
          case StreamActiveType.Active:
            return entry.streams.some(
              (stream) => stream.currentFlowRate !== "0"
            );

          case StreamActiveType.NoActive:
            return !entry.streams.some(
              (stream) => stream.currentFlowRate !== "0"
            );

          default:
            return true;
        }
      });
  }, [mappedEntries, addressesFilter, streamActiveFilter]);

  const paginatedEntries = useMemo(
    () => filteredEntries.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [page, rowsPerPage, filteredEntries]
  );

  const streamsLoading =
    incomingStreamsQuery.isLoading || outgoingStreamsQuery.isLoading;

  return (
    <Container maxWidth="lg">
      <AddressSearchDialog
        title={"Add an address"}
        index={<AddressSearchIndex onSelectAddress={onAddAddress} />}
        open={showAddDialog}
        onClose={closeAddDialog}
        onSelectAddress={onAddAddress}
        showAddressBook={false}
      />

      <Stack gap={isBelowMd ? 2.5 : 4.5}>
        <Stack direction="row" gap={1.5} alignItems="center">
          <Typography variant="h3" flex={1}>
            Address Book
          </Typography>

          {!isBelowMd ? (
            <>
              <ReadFileButton onLoaded={onImport} mimeType=".csv">
                {({ selectFile }) => (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={selectFile}
                  >
                    Import
                  </Button>
                )}
              </ReadFileButton>

              <DownloadButton
                content={exportableAddressBookContent}
                fileName={`address_book_${new Date().getTime()}.csv`}
                contentType="text/csv;charset=utf-8;"
              >
                {({ download }) => (
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={download}
                  >
                    Export
                  </Button>
                )}
              </DownloadButton>
            </>
          ) : (
            <Stack direction="row" gap={1.5}>
              {!isDeleting && (
                <Button
                  variant="textContained"
                  color="primary"
                  size="small"
                  onClick={openAddDialog}
                >
                  Add
                </Button>
              )}

              <Button
                variant="textContained"
                color="error"
                size="small"
                disabled={isDeleting && selectedAddresses.length === 0}
                onClick={isDeleting ? deleteEntries : startDeleting}
              >
                {isDeleting
                  ? `Confirm (${selectedAddresses.length})`
                  : "Remove"}
              </Button>

              {isDeleting && (
                <Button
                  variant="outlined"
                  color="secondary"
                  size="small"
                  onClick={cancelDeleting}
                >
                  Cancel
                </Button>
              )}
            </Stack>
          )}
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            [theme.breakpoints.down("md")]: {
              flexDirection: "column",
              gap: 2,
            },
          }}
        >
          <Stack
            direction="row"
            gap={1.5}
            sx={{
              [theme.breakpoints.down("md")]: {
                justifyContent: "space-between",
              },
            }}
          >
            <AddressFilter
              addressesFilter={addressesFilter}
              onChange={onAddressesFilterChange}
            />
            <StreamActiveFilter
              activeType={streamActiveFilter}
              onChange={onStreamActiveFilterChange}
            />
          </Stack>
          {!isBelowMd && (
            <Stack direction="row" gap={1.5}>
              {!isDeleting && (
                <Button
                  variant="textContained"
                  color="primary"
                  onClick={openAddDialog}
                >
                  Add Address
                </Button>
              )}

              <Button
                variant="textContained"
                color="error"
                disabled={isDeleting && selectedAddresses.length === 0}
                onClick={isDeleting ? deleteEntries : startDeleting}
              >
                {isDeleting
                  ? `Confirm removing (${selectedAddresses.length})`
                  : "Remove Address"}
              </Button>

              {isDeleting && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={cancelDeleting}
                >
                  Cancel
                </Button>
              )}
            </Stack>
          )}
        </Stack>

        {filteredEntries.length === 0 && (
          <Paper elevation={1} sx={{ px: 12, py: 7 }}>
            <Typography variant="h4" textAlign="center">
              No Addresses Available
            </Typography>
            <Typography color="text.secondary" textAlign="center">
              Addresses you have transacted with or imported will appear here.
            </Typography>
          </Paper>
        )}

        {filteredEntries.length > 0 && (
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
            <Table sx={{ tableLayout: "fixed" }}>
              {!isBelowMd && (
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ pl: 10 }}>Name</TableCell>
                    <TableCell width="200px">ENS Name</TableCell>
                    <TableCell width="200px">Address</TableCell>
                    <TableCell width="160px">Active Streams</TableCell>
                    <TableCell width="88px" />
                  </TableRow>
                </TableHead>
              )}
              <TableBody>
                {paginatedEntries.map(({ address, name, streams }) =>
                  isBelowMd ? (
                    <AddressBookMobileRow
                      key={address}
                      address={address}
                      selected={selectedAddresses.includes(address)}
                      selectable={isDeleting}
                      onSelect={setRowSelected(address)}
                    />
                  ) : (
                    <AddressBookRow
                      key={address}
                      address={address}
                      name={name}
                      selected={selectedAddresses.includes(address)}
                      selectable={isDeleting}
                      onSelect={setRowSelected(address)}
                      streams={streams}
                      streamsLoading={streamsLoading}
                    />
                  )
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredEntries.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                "> *": {
                  visibility:
                    filteredEntries.length <= rowsPerPage
                      ? "hidden"
                      : "visible",
                },
              }}
            />
          </TableContainer>
        )}
      </Stack>
    </Container>
  );
};

export default AddressBook;
