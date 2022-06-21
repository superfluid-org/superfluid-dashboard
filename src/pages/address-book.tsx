import {
  Button,
  Container,
  Menu,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import { MouseEvent, useCallback, useState } from "react";
import AddressAvatar from "../components/AddressAvatar/AddressAvatar";
import AddressName from "../components/AddressName/AddressName";
import AddressSearchDialog from "../components/AddressSearchDialog/AddressSearchDialog";
import {
  addAddressBookEntry,
  AddressBookEntry,
  addressBookSelectors,
} from "../features/addressBook/addressBook.slice";
import { useAppDispatch, useAppSelector } from "../features/redux/store";
import AddressSearchIndex from "../features/send/AddressSearchIndex";
import StreamActiveFilter, {
  StreamActiveType,
} from "../features/streamsTable/StreamActiveFilter";
import { arrayToCSV } from "../utils/CSVUtils";

const AddressBook: NextPage = ({}) => {
  const dispatch = useAppDispatch();

  const [streamActiveFilter, setStreamActiveFilter] = useState(
    StreamActiveType.All
  );
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [streamsFilterAnchor, setStreamsFilterAnchor] =
    useState<HTMLButtonElement | null>(null);

  const addressBookEntries = useAppSelector((state) =>
    addressBookSelectors.selectAll(state.addressBook)
  );

  const onStreamActiveFilterChange = (filter: StreamActiveType) => {
    setStreamActiveFilter(filter);
    closeStreamsFilter();
  };

  const openAddDialog = () => setShowAddDialog(true);
  const closeAddDialog = () => setShowAddDialog(false);

  const openStreamsFilter = (event: MouseEvent<HTMLButtonElement>) =>
    setStreamsFilterAnchor(event.currentTarget);
  const closeStreamsFilter = () => setStreamsFilterAnchor(null);

  const onAddAddress = (address: any) =>
    dispatch(
      addAddressBookEntry({
        address: address,
      })
    );

  const download = useCallback(() => {
    const content = arrayToCSV(
      addressBookEntries.map(({ address, name }) => ({
        ADDRESS: address,
        NAME: name,
      }))
    );
    // const csvData = new Blob([output], { type: "text/csv;charset=utf-8;" });
    // const csvURL = URL.createObjectURL(csvData);
    // downloadRef.current.href = csvURL;
    // downloadRef.current.setAttribute(
    //   "download",
    //   `address_book_${new Date().getTime()}.csv`
    // );
    // downloadRef.current.click();
  }, [addressBookEntries]);

  console.log(addressBookEntries);

  return (
    <Container maxWidth="lg">
      <AddressSearchDialog
        title={"Add an address"}
        index={<AddressSearchIndex onSelectAddress={onAddAddress} />}
        open={showAddDialog}
        onClose={closeAddDialog}
        onSelectAddress={onAddAddress}
      />

      <Stack gap={4.5}>
        <Stack direction="row" gap={1.5} alignItems="center">
          <Typography variant="h3" flex={1}>
            Address Book
          </Typography>
          <Button variant="outlined" color="secondary">
            Import
          </Button>
          <Button variant="outlined" color="secondary" onClick={download}>
            export
          </Button>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" gap={1.5}>
            <Button variant="outlined" color="secondary">
              All Addresses
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={openStreamsFilter}
            >
              {streamActiveFilter}
            </Button>
            <StreamActiveFilter
              anchorEl={streamsFilterAnchor}
              onChange={onStreamActiveFilterChange}
              onClose={closeStreamsFilter}
            />
          </Stack>
          <Stack direction="row" gap={1.5}>
            <Button
              variant="textContained"
              color="primary"
              onClick={openAddDialog}
            >
              Add Address
            </Button>
            <Button variant="textContained" color="error">
              Remove Address
            </Button>
          </Stack>
        </Stack>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Active Streams</TableCell>
                <TableCell>Total Sent/Received</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {addressBookEntries.map(({ address }) => (
                <TableRow key={address}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <AddressAvatar address={address} />
                      <Typography variant="h6">
                        <AddressName address={address} />
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>3</TableCell>
                  <TableCell>3</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Container>
  );
};

export default AddressBook;
