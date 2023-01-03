import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Button,
  debounce,
  DialogActions,
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
import {
  FC,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import ResponsiveDialog from "../../features/common/ResponsiveDialog";
import AddressAvatar from "../Avatar/AddressAvatar";
import { getAddress, isAddress } from "../../utils/memoizedEthersUtils";
import useAddressName from "../../hooks/useAddressName";
import { useAppSelector } from "../../features/redux/store";
import { addressBookSelectors } from "../../features/addressBook/addressBook.slice";
import { ensApi } from "../../features/ens/ensApi.slice";
import shortenHex from "../../utils/shortenHex";
import { Address } from "@superfluid-finance/sdk-core";
import Box from "@mui/material/Box/Box";

const LIST_ITEM_STYLE = { px: 3, minHeight: 68 };

interface AddressListItemProps {
  address: string;
  selected?: boolean;
  disabled?: boolean;
  namePlaceholder?: string;
  dataCy?: string;
  onClick: () => void;
  showRemove?: boolean;
}

export const AddressListItem: FC<AddressListItemProps> = ({
  address,
  selected = false,
  disabled = false,
  dataCy,
  onClick,
  namePlaceholder,
  showRemove = false,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { name, addressChecksummed: checksumHex } = useAddressName(address);

  return (
    <ListItemButton
      onClick={onClick}
      sx={LIST_ITEM_STYLE}
      translate="no"
      selected={selected}
      disabled={disabled}
    >
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
      {showRemove && (
        <IconButton size="small" onClick={onClick}>
          <CloseRoundedIcon sx={{ color: theme.palette.text.secondary }} />
        </IconButton>
      )}
    </ListItemButton>
  );
};

export type AddressSearchDialogProps = {
  title: string;
  open: boolean;
  index: ReactNode | null;
  addresses?: Address[];
  onClose: () => void;
  onSelectAddress: (address: string) => void;
  showAddressBook?: boolean;
  disableAutoselect?: boolean;
  disabledAddresses?: Address[];
  showSelected?: boolean;
};

export default memo(function AddressSearchDialog({
  open,
  addresses = [],
  onSelectAddress,
  onClose,
  title,
  index,
  showAddressBook = true,
  disableAutoselect = false,
  disabledAddresses = [],
  showSelected = false,
}: AddressSearchDialogProps) {
  const theme = useTheme();

  const [searchTermVisible, setSearchTermVisible] = useState("");
  const [searchTermDebounced, _setSearchTermDebounced] =
    useState(searchTermVisible);

  const setSearchTermDebounced = useCallback(
    debounce((searchTerm) => {
      _setSearchTermDebounced(searchTerm);
    }, 250),
    []
  );

  const setSearchTerm = useCallback(
    (searchTerm: string) => {
      setSearchTermVisible(searchTerm);

      const searchTermTrimmed = searchTerm.trim();
      if (isAddress(searchTermTrimmed) && !disableAutoselect) {
        onSelectAddress(getAddress(searchTermTrimmed));
      }

      setSearchTermDebounced(searchTermTrimmed);
    },
    [
      disableAutoselect,
      onSelectAddress,
      setSearchTermVisible,
      setSearchTermDebounced,
    ]
  );

  const [openCounter, setOpenCounter] = useState(0);

  useEffect(() => {
    if (open) {
      setOpenCounter(openCounter + 1);
      setSearchTermVisible(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
      setSearchTermDebounced(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addressBookResults = useAppSelector((state) =>
    addressBookSelectors.searchAddressBookEntries(state, searchTermDebounced)
  );

  const ensQuery = ensApi.useResolveNameQuery(searchTermDebounced);
  const ensData = ensQuery.data; // Put into separate variable because TS couldn't infer in the render function that `!!ensQuery.data` means that the data is not undefined nor null.
  const showEns = !!searchTermDebounced && !isAddress(searchTermDebounced);

  const checksummedSearchedAddress = useMemo(() => {
    if (!!searchTermDebounced && isAddress(searchTermDebounced)) {
      return getAddress(searchTermDebounced);
    }
    return null;
  }, [searchTermDebounced]);

  const searchSynced = searchTermDebounced === searchTermVisible.trim();

  return (
    <ResponsiveDialog
      data-cy={"receiver-dialog"}
      open={open}
      onClose={() => onClose()}
      PaperProps={{ sx: { borderRadius: "20px", maxWidth: 550 } }}
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
          <CloseRoundedIcon />
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
                        selected={addresses.includes(ensData.address)}
                        disabled={disabledAddresses.includes(ensData.address)}
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

            {checksummedSearchedAddress && (
              <>
                <ListSubheader sx={{ px: 3 }}>Search</ListSubheader>
                <AddressListItem
                  key={checksummedSearchedAddress}
                  selected={addresses.includes(checksummedSearchedAddress)}
                  disabled={disabledAddresses.includes(
                    checksummedSearchedAddress
                  )}
                  address={checksummedSearchedAddress}
                  onClick={() => onSelectAddress(checksummedSearchedAddress)}
                />
              </>
            )}

            {showAddressBook && (
              <>
                <ListSubheader sx={{ px: 3 }}>Address Book</ListSubheader>
                {addressBookResults.length === 0 && (
                  <ListItem sx={LIST_ITEM_STYLE}>
                    <ListItemText translate="yes" primary="No results" />
                  </ListItem>
                )}
                {addressBookResults.map(({ address, name }) => (
                  <AddressListItem
                    dataCy={"address-book-entry"}
                    key={address}
                    selected={addresses.includes(address)}
                    disabled={disabledAddresses.includes(address)}
                    address={address}
                    onClick={() => onSelectAddress(address)}
                    namePlaceholder={name}
                  />
                ))}
              </>
            )}
          </List>
        )}
      </DialogContent>
      {showSelected && addresses.length > 0 && (
        <>
          <DialogContent
            sx={{
              p: 0,
              maxHeight: "320px",
              overflow: "auto",
              flex: "0 0 auto",
            }}
          >
            <List
              disablePadding
              sx={{
                position: "sticky",
                bottom: 0,
                width: "100%",
                background: theme.palette.background.paper,
              }}
            >
              <ListSubheader sx={{ px: 3 }}>Selected</ListSubheader>
              {addresses.map((address) => (
                <AddressListItem
                  key={`${address}-selected`}
                  selected
                  showRemove
                  address={address}
                  onClick={() => onSelectAddress(address)}
                />
              ))}
            </List>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button variant="contained" size="xl" onClick={onClose}>
              Ok
            </Button>
          </DialogActions>
        </>
      )}
    </ResponsiveDialog>
  );
});
