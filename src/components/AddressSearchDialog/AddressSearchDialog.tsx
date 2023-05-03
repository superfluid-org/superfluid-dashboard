import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Box,
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
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  AddressBookEntry,
  addressBookSelectors,
} from "../../features/addressBook/addressBook.slice";
import ResponsiveDialog from "../../features/common/ResponsiveDialog";
import { useAppSelector } from "../../features/redux/store";
import useAddressName from "../../hooks/useAddressName";
import { getAddress, isAddress } from "../../utils/memoizedEthersUtils";
import shortenHex from "../../utils/shortenHex";
import AddressAvatar from "../Avatar/AddressAvatar";
import {
  allNetworks,
  findNetworkOrThrow,
  Network,
} from "../../features/network/networks";
import NetworkSelect from "../NetworkSelect/NetworkSelect";
import { LoadingButton } from "@mui/lab";
import { ensApi } from "../../features/ens/ensApi.slice";
import AddressSearchIndex from "../../features/send/AddressSearchIndex";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import addressBookRpcApi from "../../features/addressBook/addressBookRpcApi.slice";

const LIST_ITEM_STYLE = { px: 3, minHeight: 68 };

interface AddressListItemProps {
  address: string;
  selected?: boolean;
  disabled?: boolean;
  namePlaceholder?: string;
  dataCy?: string;
  onClick: () => void;
  showRemove?: boolean;
  displayAvatar?: boolean;
}

export const AddressListItem: FC<AddressListItemProps> = ({
  address,
  selected = false,
  disabled = false,
  dataCy,
  onClick,
  namePlaceholder,
  showRemove = false,
  displayAvatar = true,
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
      {displayAvatar && (
        <ListItemAvatar>
          <AddressAvatar address={checksumHex} />
        </ListItemAvatar>
      )}

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
  addresses?: Address[];
  onClose?: () => void;
  onBack?: () => void;
  onSelectAddress: (
    ...params: ({ address: string } | AddressBookEntry)[]
  ) => void;
  showAddressBook?: boolean;
  disableAutoselect?: boolean;
  disabledAddresses?: Address[];
  showSelected?: boolean;
  mode?: "addressBook" | "addressSearch";
};

export const AddressSearchDialogContent: FC<AddressSearchDialogProps> = ({
  open,
  addresses = [],
  onSelectAddress,
  onClose,
  onBack,
  title,
  showAddressBook = true,
  disableAutoselect = false,
  disabledAddresses = [],
  showSelected = false,
  mode = "addressSearch",
}) => {
  const theme = useTheme();

  const { network } = useExpectedNetwork();

  const [searchTermVisible, setSearchTermVisible] = useState("");
  const [selectedNetworks, setSelectedNetworks] = useState<Network[]>([]);
  const [name, setName] = useState("");

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
        onSelectAddress({ address: getAddress(searchTermTrimmed) });
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

  const ensQuery = ensApi.useResolveNameQuery(searchTermDebounced);
  const ensData = ensQuery.data; // Put into separate variable because TS couldn't infer in the render function that `!!ensQuery.data` means that the data is not undefined nor null.
  const showEns =
    !!searchTermDebounced &&
    !isAddress(searchTermDebounced) &&
    mode === "addressSearch";

  const { isFetching: isContractDetectionLoading, data: contractData } =
    addressBookRpcApi.useIsContractQuery(searchTermVisible);

  const [openCounter, setOpenCounter] = useState(0);

  useEffect(() => {
    if (open) {
      setOpenCounter(openCounter + 1);
      setSearchTermVisible(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
      setSearchTermDebounced(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
      setSelectedNetworks([]);
      setName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addressBookResults = useAppSelector((state) =>
    addressBookSelectors.searchAddressBookEntries(state, searchTermVisible)
  );

  const checksummedSearchedAddress = useMemo(() => {
    if (!!searchTermDebounced && isAddress(searchTermDebounced)) {
      return getAddress(searchTermDebounced);
    }
    return null;
  }, [searchTermDebounced]);

  const searchSynced = searchTermDebounced === searchTermVisible.trim();

  const addressBookList = useMemo(
    () =>
      addressBookResults
        .filter(
          ({ associatedNetworks }) =>
            !associatedNetworks ||
            associatedNetworks.length === 0 ||
            associatedNetworks?.includes(network.id)
        )
        .map(({ address, name }) => (
          <Stack direction="row" alignItems="center" pr={2} key={address}>
            <AddressListItem
              dataCy={"address-book-entry"}
              selected={addresses.includes(address)}
              disabled={disabledAddresses.includes(address)}
              address={address}
              onClick={() => onSelectAddress({ address })}
              namePlaceholder={name}
            />
          </Stack>
        )),
    [
      addressBookResults,
      addresses,
      network.id,
      disabledAddresses,
      onSelectAddress,
    ]
  );

  return (
    <>
      <DialogTitle sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" gap={2} sx={{ mb: 3 }}>
          {onBack && (
            <IconButton onClick={onBack} sx={{ m: -0.5 }} color="inherit">
              <ArrowBackRoundedIcon />
            </IconButton>
          )}
          <Typography variant="h4" sx={{ flex: 1 }}>
            {title}
          </Typography>
          {onClose && (
            <IconButton onClick={onClose} sx={{ m: -0.5 }} color="inherit">
              <CloseRoundedIcon />
            </IconButton>
          )}
        </Stack>
        <Stack direction="column" gap={1}>
          <Stack>
            <Typography sx={{ m: 1 }} variant="h6">
              {contractData?.isContract ? "Contract " : "Wallet"} Address
            </Typography>
            <TextField
              data-cy={"address-dialog-input"}
              autoComplete="off"
              fullWidth
              autoFocus
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Address or ENS"
              value={searchTermVisible}
            />
          </Stack>
          {mode === "addressBook" && (
            <>
              <Stack>
                <Typography sx={{ m: 1 }} variant="h6">
                  Name
                </Typography>
                <TextField
                  data-cy={"name-dialog-input"}
                  autoComplete="off"
                  fullWidth
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name (optional)"
                  value={name}
                />
              </Stack>
              <Stack>
                <Typography sx={{ m: 1 }} variant="h6">
                  Network
                </Typography>
                <NetworkSelect
                  selectedNetworks={
                    contractData?.isContract
                      ? contractData?.associatedNetworks.map((id) =>
                          findNetworkOrThrow(allNetworks, id)
                        )
                      : selectedNetworks
                  }
                  onSelect={setSelectedNetworks}
                  readonly={contractData?.isContract}
                />
              </Stack>
            </>
          )}
        </Stack>
      </DialogTitle>
      <DialogContent dividers={false} sx={{ p: 0 }}>
        {!searchTermVisible ? (
          mode === "addressBook" ? (
            <AddressSearchIndex
              onSelectAddress={({ address }) => setSearchTerm(address)}
            />
          ) : (
            <AddressSearchIndex
              addresses={addresses}
              disabledAddresses={disabledAddresses}
              onSelectAddress={onSelectAddress}
            />
          )
        ) : (
          <List sx={{ pt: 0, pb: 0 }}>
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
                        onClick={() =>
                          onSelectAddress({ address: ensData.address })
                        }
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
            {mode === "addressSearch" && checksummedSearchedAddress && (
              <>
                <ListSubheader sx={{ px: 3 }}>Search</ListSubheader>
                <AddressListItem
                  dataCy={"search-entry"}
                  key={checksummedSearchedAddress}
                  selected={addresses.includes(checksummedSearchedAddress)}
                  disabled={disabledAddresses.includes(
                    checksummedSearchedAddress
                  )}
                  address={checksummedSearchedAddress}
                  onClick={() =>
                    onSelectAddress({ address: checksummedSearchedAddress })
                  }
                />
              </>
            )}
            {showAddressBook && (
              <>
                <ListSubheader sx={{ px: 3 }}>Address Book</ListSubheader>
                {addressBookList.length > 0 ? (
                  addressBookList
                ) : (
                  <ListItem sx={LIST_ITEM_STYLE}>
                    <ListItemText translate="yes" primary="No results" />
                  </ListItem>
                )}
              </>
            )}
          </List>
        )}
        {mode === "addressBook" && (
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <LoadingButton
              loading={isContractDetectionLoading || ensQuery.isFetching}
              disabled={
                isContractDetectionLoading ||
                !Boolean(searchTermVisible) ||
                !(ensData || checksummedSearchedAddress)
              }
              fullWidth
              variant="contained"
              onClick={() => {
                onSelectAddress({
                  address: ensData?.address ?? checksummedSearchedAddress!,
                  associatedNetworks: contractData?.isContract
                    ? contractData.associatedNetworks
                    : selectedNetworks.map(({ id }) => id),
                  name,
                  isContract: contractData?.isContract,
                });
              }}
            >
              Save
            </LoadingButton>
          </Box>
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
                  dataCy={"list-selected-address"}
                  key={`${address}-selected`}
                  selected
                  showRemove
                  address={address}
                  onClick={() => onSelectAddress({ address })}
                />
              ))}
            </List>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              data-cy={"ok-button"}
              variant="contained"
              size="xl"
              onClick={onClose}
            >
              Ok
            </Button>
          </DialogActions>
        </>
      )}
    </>
  );
};

export default memo(function AddressSearchDialog({
  open,
  addresses,
  onSelectAddress,
  onClose,
  onBack,
  title,
  showAddressBook,
  disableAutoselect,
  disabledAddresses,
  showSelected,
  mode,
}: AddressSearchDialogProps) {
  const handleClose = useCallback(() => {
    if (onClose) onClose();
    if (onBack) onBack();
  }, [onClose, onBack]);

  return (
    <ResponsiveDialog
      data-cy={"receiver-dialog"}
      open={open}
      onClose={handleClose}
      PaperProps={{ sx: { borderRadius: "20px", maxWidth: 550 } }}
    >
      <AddressSearchDialogContent
        open={open}
        addresses={addresses}
        title={title}
        showAddressBook={showAddressBook}
        disableAutoselect={disableAutoselect}
        disabledAddresses={disabledAddresses}
        mode={mode}
        showSelected={showSelected}
        onSelectAddress={onSelectAddress}
        onClose={onClose}
        onBack={onBack}
      />
    </ResponsiveDialog>
  );
});
