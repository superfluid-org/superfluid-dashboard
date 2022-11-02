import CloseIcon from "@mui/icons-material/Close";
import {
  debounce,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, memo, ReactNode, useEffect, useState } from "react";
import ResponsiveDialog from "../../features/common/ResponsiveDialog";
import AddressAvatar from "../Avatar/AddressAvatar";
import { getAddress, isAddress } from "../../utils/memoizedEthersUtils";
import useAddressName from "../../hooks/useAddressName";
import { useAppSelector } from "../../features/redux/store";
import { addressBookSelectors } from "../../features/addressBook/addressBook.slice";
import { ensApi } from "../../features/ens/ensApi.slice";
import shortenHex from "../../utils/shortenHex";

const LIST_ITEM_STYLE = { px: 3, minHeight: 68 };

interface AddressListItemProps {
  address: string;
  namePlaceholder?: string;
  dataCy?: string;
  onClick: () => void;
}

export const AddressListItem: FC<AddressListItemProps> = ({
  address,
  dataCy,
  onClick,
  namePlaceholder,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { name, addressChecksummed: checksumHex } = useAddressName(address);

  return (
    <ListItemButton onClick={onClick} sx={LIST_ITEM_STYLE} translate="no">
      <ListItemAvatar>
        <AddressAvatar address={checksumHex} />
      </ListItemAvatar>
      <ListItemText
        {...(dataCy ? { "data-cy": dataCy } : {})}
        primary={
          name ||
          namePlaceholder ||
          (isBelowMd ? shortenHex(checksumHex, 8) : checksumHex)
        }
        secondary={
          (name || namePlaceholder) &&
          (isBelowMd ? shortenHex(checksumHex, 8) : checksumHex)
        }
      />
    </ListItemButton>
  );
};

export type AddressSearchDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelectAddress: (address: string) => void;
  title: string;
  index: ReactNode | null;
  showAddressBook?: boolean;
};

export default memo(function AddressSearchDialog({
  open,
  onSelectAddress,
  onClose,
  title,
  index,
  showAddressBook = true,
}: AddressSearchDialogProps) {
  const theme = useTheme();

  const [searchTermVisible, setSearchTermVisible] = useState("");
  const [searchTermDebounced, _setSearchTermDebounced] =
    useState(searchTermVisible);

  const [setSearchTermDebounced] = useState(() =>
    debounce((searchTerm) => {
      _setSearchTermDebounced(searchTerm);
    }, 250)
  );

  const setSearchTerm = (searchTerm: string) => {
    setSearchTermVisible(searchTerm);
    setSearchTermDebounced(searchTerm.trim());
  };

  const [openCounter, setOpenCounter] = useState(0);

  useEffect(() => {
    if (open) {
      setOpenCounter(openCounter + 1);
      setSearchTermVisible(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
      setSearchTermDebounced(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (isAddress(searchTermDebounced)) {
      onSelectAddress(getAddress(searchTermDebounced));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTermDebounced]);

  const addressBookResults = useAppSelector((state) =>
    addressBookSelectors.searchAddressBookEntries(state, searchTermDebounced)
  );

  const ensQuery = ensApi.useResolveNameQuery(searchTermDebounced);
  const ensData = ensQuery.data; // Put into separate variable because TS couldn't infer in the render function that `!!ensQuery.data` means that the data is not undefined nor null.
  const showEns = !!searchTermDebounced && !isAddress(searchTermDebounced);

  const searchSynced = searchTermDebounced === searchTermVisible;

  return (
    <ResponsiveDialog
      data-cy={"receiver-dialog"}
      open={open}
      onClose={() => onClose()}
      PaperProps={{ sx: { borderRadius: "20px", maxWidth: 500 } }}
    >
      <DialogTitle sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>
          {title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: theme.spacing(3),
            top: theme.spacing(3),
          }}
        >
          <CloseIcon />
        </IconButton>
        <TextField
          data-cy={"address-dialog-input"}
          fullWidth
          autoFocus
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Address or ENS"
          value={searchTermVisible}
        />
      </DialogTitle>
      <DialogContent dividers={false} sx={{ p: 0 }}>
        {!searchTermVisible ? (
          index
        ) : (
          <List sx={{ pt: 0 }}>
            {showEns ? (
              <>
                <ListSubheader sx={{ px: 3 }}>ENS</ListSubheader>
                {(ensQuery.isFetching || !searchSynced) && (
                  <ListItem sx={LIST_ITEM_STYLE}>
                    <ListItemText translate="yes" primary="Loading..." />
                  </ListItem>
                )}
                {ensQuery.isError && (
                  <ListItem sx={LIST_ITEM_STYLE}>
                    <ListItemText translate="yes" primary="Error" />
                  </ListItem>
                )}
                {!ensQuery.isLoading && !ensQuery.isFetching && searchSynced && (
                  <>
                    {!!ensData ? (
                      <AddressListItem
                        dataCy={"ens-entry"}
                        address={ensData.address}
                        onClick={() => onSelectAddress(ensData.address)}
                        namePlaceholder={ensData.name}
                      />
                    ) : (
                      <ListItem sx={LIST_ITEM_STYLE}>
                        <ListItemText translate="yes" primary="No results" />
                      </ListItem>
                    )}
                  </>
                )}
              </>
            ) : null}

            {showAddressBook && (
              <>
                <ListSubheader sx={{ px: 3 }}>Address Book</ListSubheader>
                {addressBookResults.length === 0 && (
                  <ListItem sx={LIST_ITEM_STYLE}>
                    <ListItemText translate="yes" primary="No results" />
                  </ListItem>
                )}
                {addressBookResults.map((addressBookEntry) => (
                  <AddressListItem
                    dataCy={"address-book-entry"}
                    key={addressBookEntry.address}
                    address={addressBookEntry.address}
                    onClick={() => onSelectAddress(addressBookEntry.address)}
                    namePlaceholder={addressBookEntry.name}
                  />
                ))}
              </>
            )}
          </List>
        )}
      </DialogContent>
    </ResponsiveDialog>
  );
});
