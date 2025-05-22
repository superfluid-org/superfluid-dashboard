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
import { skipToken } from "@reduxjs/toolkit/query";
import { Address } from "@superfluid-finance/sdk-core";
import { NextPage } from "next";
import { parse, unparse } from "papaparse";
import { ChangeEvent, useCallback, useMemo, useState } from "react";
import AddressSearchDialog from "../components/AddressSearchDialog/AddressSearchDialog";
import DownloadButton from "../components/DownloadButton/DownloadButton";
import ReadFileButton from "../components/ReadFileButton/ReadFileButton";
import withStaticSEO from "../components/SEO/withStaticSEO";
import {
  adapter,
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
import StreamActiveFilter, {
  StreamActiveType,
} from "../features/streamsTable/StreamActiveFilter";
import { getAddress } from "../utils/memoizedEthersUtils";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";
import { publicClientToProvider } from "../utils/wagmiEthersAdapters";
import { resolvedWagmiClients } from "../features/wallet/WagmiManager";
import { efpApi } from "../features/efp/efpApi.slice";
import { useAccount } from "@/hooks/useAccount"
import AddressBookLoadingRow from "../features/addressBook/AddressBookLoadingRow";
import AddressBookMobileLoadingRow from "../features/addressBook/AddressBookMobileLoadingRow";
import Link from "@/features/common/Link";

const AddressBook: NextPage = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { visibleAddress } = useVisibleAddress();
  const { network } = useExpectedNetwork();
  const [page, setPage] = useState({ wallet: 0, contract: 0, following: 0 });
  const [rowsPerPage, setRowsPerPage] = useState({ wallet: 25, contract: 25, following: 25 });
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addressesFilter, setAddressesFilter] = useState<Address[]>([]);
  const [streamActiveFilter, setStreamActiveFilter] = useState(
    StreamActiveType.All
  );
  const [isImportInProgress, setIsImportInProgress] = useState(false);

  const addressBookEntries = useAppSelector((state) =>
    addressBookSelectors.selectAll(state.addressBook)
  );

  const { address: accountAddress } = useAccount();

  const statsQuery = efpApi.useGetStatsQuery(accountAddress);
  const totalFollowing = statsQuery.data?.following;

  const followingQuery = efpApi.useGetFollowingQuery({
    address: accountAddress,
    offset: page.following * rowsPerPage.following,
    limit: rowsPerPage.following,
  });
  const following = followingQuery.data;
  const isFollowingLoading = followingQuery.isLoading || followingQuery.isFetching;

  const incomingStreamsQuery = subgraphApi.useStreamsQuery(
    visibleAddress
      ? {
        chainId: network.id,
        filter: {
          sender: visibleAddress.toLowerCase(),
          currentFlowRate_gt: "0",
        },
        pagination: {
          take: Infinity
        },
        order: {
          orderBy: "updatedAtTimestamp",
          orderDirection: "desc",
        },
      }
      : skipToken
  );

  const outgoingStreamsQuery = subgraphApi.useStreamsQuery(
    visibleAddress
      ? {
        chainId: network.id,
        filter: {
          receiver: visibleAddress.toLowerCase(),
          currentFlowRate_gt: "0",
        },
        pagination: {
          take: Infinity
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
    setPage((page) => ({ ...page, address: 0 }));
  };

  // Stream active filter

  const onStreamActiveFilterChange = (filter: StreamActiveType) => {
    setStreamActiveFilter(filter);
    setPage((page) => ({ ...page, address: 0 }));
  };

  // Adding new address

  const openAddDialog = () => setShowAddDialog(true);
  const closeAddDialog = () => setShowAddDialog(false);

  const onAddAddress = (...params: AddressBookEntry[]) => {
    if (params.length === 1) {
      dispatch(addAddressBookEntry(params[0]));
    } else {
      dispatch(addAddressBookEntries(params));
    }
    closeAddDialog();
  };

  // Pagination

  const handleChangePage =
    (table: "wallet" | "contract" | "following") => (_e: unknown, newPage: number) => {
      setPage((page) => ({ ...page, [table]: newPage }));
    };

  const handleChangeRowsPerPage =
    (table: "wallet" | "contract" | "following") =>
      (event: ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage((rowsPerPage) => {
          const newRowsPerPage = parseInt(event.target.value, 10);
          return ({
            ...rowsPerPage,
            [table]: newRowsPerPage,
          });
        });
        setPage((page) => ({ ...page, [table]: 0 }));
      };

  // Importing address book

  const onImport = async (file: File) => {
    try {
      setIsImportInProgress(true);
      const blob = new Blob([file], { type: "text/csv;charset=utf-8" });
      const contents = await blob.text();

      const { data: parsedCSV } = parse<{
        address: string;
        name?: string;
        chainid?: string;
      }>(contents, {
        header: true,
        transformHeader: (header: string) => header.toLowerCase(),
      });

      const mappedData: AddressBookEntry[] = await parsedCSV.reduce(
        async (mappedData: Promise<AddressBookEntry[]>, item, index) => {
          const result = await mappedData;
          try {
            const chainIds = item.chainid
              ? item.chainid.split(" ").map(Number)
              : [];
            const parsedItem = {
              name: item.name,
              address: getAddress(item.address),
              associatedNetworks: chainIds,
              isContract: false,
            };

            const firstChainId = chainIds[0];
            if (firstChainId) {
              const provider = publicClientToProvider(
                resolvedWagmiClients[firstChainId]()
              );

              if ((await provider.getCode(parsedItem.address)) !== "0x") {
                parsedItem.isContract = true;
              }
            }

            return [...result, parsedItem];
          } catch (e) {
            // Using index + 2 here because the first row is for titles
            console.error(`Failed to parse row ${index + 2}!`, e);
            return mappedData;
          }
        },
        Promise.resolve([])
      );

      setIsImportInProgress(false);
      insertImportedAddresses(mappedData);
    } catch (e) {
      console.error(
        "Someting went wrong while reading imported address book file.",
        e
      );
    }
  };

  const insertImportedAddresses = useCallback(
    (newEntries: AddressBookEntry[]) =>
      dispatch(addAddressBookEntries(newEntries)),
    [dispatch]
  );

  // Exporting address book

  const exportableAddressBookContent = useMemo(
    () =>
      unparse(
        addressBookEntries.map(({ address, name, associatedNetworks }) => ({
          ADDRESS: address,
          NAME: name,
          CHAINID: associatedNetworks?.join(" "),
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

  const mappedFollowing = useMemo(() => {
    const allStreams = (incomingStreamsQuery.data?.items || []).concat(
      outgoingStreamsQuery.data?.items || []
    );

    return following ? following?.map((entry) => {
      return {
        ...entry,
        streams: allStreams.filter((stream) =>
          [stream.sender.toLowerCase(), stream.receiver.toLowerCase()].includes(
            entry.address.toLowerCase()
          )
        ),
      };
    }) : [];
  }, [
    incomingStreamsQuery.data,
    outgoingStreamsQuery.data,
    following,
  ]);

  const filteredEntries = useMemo(
    () =>
      mappedEntries
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
        }),
    [mappedEntries, addressesFilter, streamActiveFilter]
  );

  const filteredFollowing = useMemo(
    () =>
      mappedFollowing
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
        }),
    [mappedFollowing, addressesFilter, streamActiveFilter]
  );

  const filteredAddresses = useMemo(
    () => filteredEntries.filter((entry) => !entry.isContract),
    [filteredEntries]
  );

  const filteredContracts = useMemo(
    () => filteredEntries.filter((entry) => entry.isContract),
    [filteredEntries]
  );

  const paginatedAddresses = useMemo(
    () =>
      filteredAddresses.slice(
        page.wallet * rowsPerPage.wallet,
        (page.wallet + 1) * rowsPerPage.wallet
      ),
    [page.wallet, rowsPerPage, filteredAddresses]
  );

  const paginatedContracts = useMemo(
    () =>
      filteredContracts.slice(
        page.contract * rowsPerPage.contract,
        (page.contract + 1) * rowsPerPage.contract
      ),
    [page.contract, rowsPerPage, filteredContracts]
  );
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
    dispatch(
      removeAddressBookEntries(
        filteredEntries
          .filter((entry) => selectedAddresses.includes(entry.address))
          .map(adapter.selectId)
      )
    );
    cancelDeleting();

    // If all entries on the last page are removed then move one page back.
    if (
      page.wallet > 0 &&
      Math.ceil(filteredEntries.length / rowsPerPage.wallet) - 1 ===
      page.wallet &&
      selectedAddresses.length === paginatedAddresses.length
    ) {
      setPage((page) => ({ ...page, address: page.wallet - 1 }));
    }
  }, [
    selectedAddresses,
    dispatch,
    paginatedAddresses,
    filteredEntries,
    rowsPerPage,
    page,
  ]);

  const streamsLoading =
    incomingStreamsQuery.isLoading || outgoingStreamsQuery.isLoading;

  const onStarAddress = (address: Address) => {
    if (addressBookEntries.some((entry) => entry.address.toLowerCase() === address.toLowerCase())) {
      dispatch(
        removeAddressBookEntries(
          filteredEntries
            .filter((entry) => entry.address.toLowerCase() === address.toLowerCase())
            .map(adapter.selectId)
        )
      );
    } else {
      onAddAddress({ address, name: "", associatedNetworks: [1, 10, 8453], isContract: false });
    }
  };

  return (
    <Container maxWidth="lg">
      <AddressSearchDialog
        title={"Add an address"}
        open={showAddDialog}
        onClose={closeAddDialog}
        onSelectAddress={onAddAddress}
        showAddressBook={false}
        disableAutoselect
        mode="addressBook"
      />

      <Stack gap={isBelowMd ? 2.5 : 4.5}>
        <Stack direction="row" gap={1.5} alignItems="center">
          <Typography variant="h3" component="h1" flex={1} translate="yes">
            Address Book
          </Typography>

          {!isBelowMd ? (
            <>
              <ReadFileButton onLoaded={onImport} mimeType=".csv">
                {({ selectFile }) => (
                  <Button
                    data-cy={"import-button"}
                    variant="outlined"
                    color="secondary"
                    onClick={selectFile}
                    loading={isImportInProgress}
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
                    data-cy={"export-button"}
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
                  data-cy={"add-address-btn"}
                  variant="textContained"
                  color="primary"
                  onClick={openAddDialog}
                >
                  Add Address
                </Button>
              )}
              <Button
                data-cy={"remove-button"}
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
                  data-cy={"cancel-button"}
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
          <Paper elevation={1} sx={{ px: 12, py: 7 }} translate="yes">
            <Typography
              data-cy={"no-address-title"}
              variant="h4"
              textAlign="center"
            >
              No Addresses Available
            </Typography>
            <Typography
              data-cy={"no-address-message"}
              color="text.secondary"
              textAlign="center"
            >
              Addresses you have transacted with or imported will appear here.
            </Typography>
          </Paper>
        )}

        {filteredAddresses.length > 0 && (
          <>
            <Typography
              sx={{ marginBottom: isBelowMd ? -1.5 : -3.5 }}
              variant="h6"
            >
              Wallet Addresses
            </Typography>
            <TableContainer
              component={Paper}
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
              <Table data-cy="wallet-addresses" sx={{ tableLayout: "fixed" }}>
                {!isBelowMd && (
                  <TableHead>
                    <TableRow>
                      <TableCell width="150px" sx={{ pl: 10 }}>
                        Name
                      </TableCell>
                      <TableCell width="145px">Address</TableCell>
                      <TableCell width="150px">Networks</TableCell>
                      <TableCell width="160px">Active Streams</TableCell>
                      <TableCell width="88px" />
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  {paginatedAddresses.map(
                    ({ address, name, associatedNetworks, streams }) =>
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
                          chainIds={associatedNetworks}
                        />
                      )
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { value: filteredAddresses.length, label: 'All' }]}
                component="div"
                count={filteredAddresses.length}
                rowsPerPage={rowsPerPage.wallet}
                page={page.wallet}
                onPageChange={handleChangePage("wallet")}
                onRowsPerPageChange={handleChangeRowsPerPage("wallet")}
                sx={{
                  "> *": {
                    visibility:
                      filteredEntries.length <= rowsPerPage.wallet
                        ? "hidden"
                        : "visible",
                  },
                }}
              />
            </TableContainer>
          </>
        )}

        {filteredContracts.length > 0 && (
          <>
            <Typography
              sx={{ marginBottom: isBelowMd ? -1.5 : -3.5 }}
              variant="h6"
            >
              Contract Addresses
            </Typography>
            <TableContainer
              component={Paper}
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
              <Table data-cy="contract-addresses" sx={{ tableLayout: "fixed" }}>
                {!isBelowMd && (
                  <TableHead>
                    <TableRow>
                      <TableCell width="150px" sx={{ pl: 10 }}>
                        Name
                      </TableCell>
                      <TableCell width="145px">Address</TableCell>
                      <TableCell width="150px">Networks</TableCell>
                      <TableCell width="160px">Active Streams</TableCell>
                      <TableCell width="88px" />
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  {paginatedContracts.map(
                    ({ address, name, streams, associatedNetworks }) =>
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
                          isContract
                          chainIds={associatedNetworks}
                        />
                      )
                  )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100]}
                component="div"
                count={filteredContracts.length}
                rowsPerPage={rowsPerPage.contract}
                page={page.contract}
                onPageChange={handleChangePage("contract")}
                onRowsPerPageChange={handleChangeRowsPerPage("contract")}
                sx={{
                  "> *": {
                    visibility:
                      filteredEntries.length <= rowsPerPage.contract
                        ? "hidden"
                        : "visible",
                  },
                }}
              />
            </TableContainer>
          </>
        )}

        {filteredFollowing.length === 0 && !isFollowingLoading && (
          <Paper elevation={1} sx={{ px: 12, py: 7 }} translate="yes">
            <Typography
              data-cy={"no-address-title"}
              variant="h4"
              textAlign="center"
            >
              {accountAddress ? "You don't follow anyone yet" : "Connect your wallet to see your friends"}
            </Typography>
            {accountAddress && <Typography
              data-cy={"no-address-message"}
              color="text.secondary"
              textAlign="center"
            >
              Follow people on <Link href="https://efp.app" target="_blank" rel="noopener noreferrer">EFP (Ethereum Follow Protocol)</Link> to see them here.
            </Typography>}
          </Paper>
        )}

        {(filteredFollowing.length > 0 || isFollowingLoading) && (
          <>
            <Typography
              sx={{ marginBottom: isBelowMd ? -1.5 : -3.5 }}
              variant="h6"
            >
              Onchain Friends | EFP Followings
            </Typography>
            <TableContainer
              component={Paper}
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
              <Table data-cy="wallet-addresses" sx={{ tableLayout: "fixed" }}>
                {!isBelowMd && (
                  <TableHead>
                    <TableRow>
                      <TableCell width="150px" sx={{ pl: 10 }}>
                        Name
                      </TableCell>
                      <TableCell width="145px">Address</TableCell>
                      <TableCell width="150px">Networks</TableCell>
                      <TableCell width="160px">Active Streams</TableCell>
                      <TableCell width="88px" />
                    </TableRow>
                  </TableHead>
                )}
                <TableBody>
                  {isFollowingLoading ?
                    Array.from({ length: rowsPerPage.following }).map((_, index) => (
                      isBelowMd ? <AddressBookMobileLoadingRow key={index} /> : <AddressBookLoadingRow key={index} />
                    ))
                    : filteredFollowing.map(
                      ({ address, streams }) =>
                        isBelowMd ? (
                          <AddressBookMobileRow
                            key={address}
                            address={address}
                            selected={selectedAddresses.includes(address)}
                            selectable={false}
                            onSelect={setRowSelected(address)}
                            isStarred={addressBookEntries.some((entry) => entry.address.toLowerCase() === address.toLowerCase())}
                            onStarClick={() => onStarAddress(address)}
                          />
                        ) : (
                          <AddressBookRow
                            key={address}
                            address={address}
                            selected={selectedAddresses.includes(address)}
                            selectable={false}
                            onSelect={setRowSelected(address)}
                            streams={streams}
                            streamsLoading={streamsLoading}
                            chainIds={[1, 10, 8453]}
                            canEdit={false}
                            isStarred={addressBookEntries.some((entry) => entry.address.toLowerCase() === address.toLowerCase())}
                            onStarClick={() => onStarAddress(address)}
                          />
                        )
                    )}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalFollowing || filteredFollowing.length}
                rowsPerPage={rowsPerPage.following}
                page={page.following}
                onPageChange={handleChangePage("following")}
                onRowsPerPageChange={handleChangeRowsPerPage("following")}
                sx={{
                  "> *": {
                    visibility:
                      (totalFollowing || filteredFollowing.length) <= rowsPerPage.following
                        ? "hidden"
                        : "visible",
                  },
                }}
              />
            </TableContainer>
          </>
        )}
      </Stack>
    </Container>
  );
};

export default withStaticSEO(
  { title: "Address Book | Superfluid" },
  AddressBook
);
