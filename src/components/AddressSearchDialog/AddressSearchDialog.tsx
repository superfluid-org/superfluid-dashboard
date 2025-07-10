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
  Skeleton,
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
import AddressSearchIndex from "../../features/send/AddressSearchIndex";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import addressBookRpcApi from "../../features/addressBook/addressBookRpcApi.slice";
import { whoisApi } from "../../features/whois/whoisApi.slice";
import { efpApi } from "../../features/efp/efpApi.slice";
import { useAccount } from "@/hooks/useAccount"

const LIST_ITEM_STYLE = { px: 3, minHeight: 68 };

interface AddressListItemProps {
  address: string;
  selected?: boolean;
  disabled?: boolean;
  name?: string;
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
  name,
  showRemove = false,
  displayAvatar = true,
}) => {
  const addressName = useAddressName(address);
  const theme = useTheme();

  return (
    <ListItem sx={LIST_ITEM_STYLE}>
      <ListItemButton
        data-cy={dataCy}
        selected={selected}
        disabled={disabled}
        onClick={onClick}
      >
        {displayAvatar && (
          <ListItemAvatar>
            <AddressAvatar address={address} />
          </ListItemAvatar>
        )}
        <ListItemText
          primary={name || addressName.name || shortenHex(address, 6)}
          secondary={shortenHex(address, 6)}
        />
      </ListItemButton>
    </ListItem>
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

  const setSearchTermDebounced = useCallback<((searchTerm: string) => void)>(
    debounce((searchTerm: string) => {
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

  // Use whois reverse resolve for all non-address searches
  const shouldUseWhoisReverse = !!searchTermDebounced && 
    !isAddress(searchTermDebounced);
  
  const whoisQuery = whoisApi.useReverseResolveQuery(
    shouldUseWhoisReverse ? searchTermDebounced : "", 
    { skip: !shouldUseWhoisReverse }
  );
  const whoisData = whoisQuery.data;

  const showWhoisResults =
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
              name={name}
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

  const { address: accountAddress } = useAccount();
  const followingQuery = efpApi.useGetFollowingQuery({
    address: accountAddress,
    offset: 0,
    limit: 10,
    search: searchTermDebounced,
  }, {
    skip: !searchTermDebounced,
  });
  const following = followingQuery.data;
  const followingLoading = followingQuery.isLoading || followingQuery.isFetching;

  // optional network ID filtering (.filter(() => [1, 10, 8453].includes(network.id)))
  const followingList = useMemo(() => {
    return following ? following.map(({ address }) => (
      <AddressListItem key={address} address={address} onClick={() => onSelectAddress({ address })} />
    )) : [];
  }, [following, onSelectAddress]);

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
              placeholder="Public Address, ENS domain or farcaster handle"
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
            {showWhoisResults ? (
              <>
                {/* Loading state for all whois results */}
                {(whoisQuery.isFetching || !searchSynced) && (
                  <>
                    <ListSubheader sx={{ px: 3 }}>Searching...</ListSubheader>
                    <ListItem sx={LIST_ITEM_STYLE}>
                      <ListItemText translate="yes" primary="Loading..." />
                    </ListItem>
                  </>
                )}

                {/* Error state */}
                {whoisQuery.isError && searchSynced && (
                  <>
                    <ListSubheader sx={{ px: 3 }}>Error</ListSubheader>
                    <ListItem sx={LIST_ITEM_STYLE}>
                      <ListItemText data-cy="whois-error" translate="yes" primary="Search error occurred" />
                    </ListItem>
                  </>
                )}

                {/* Success state - show recommended result */}
                {!whoisQuery.isLoading && !whoisQuery.isFetching && searchSynced && (
                  <>
                    {whoisData ? (
                      <>
                        <ListSubheader sx={{ px: 3 }}>Search Results</ListSubheader>
                        <AddressListItem
                          dataCy={"whois-entry"}
                          selected={addresses.includes(whoisData.address)}
                          disabled={disabledAddresses.includes(whoisData.address)}
                          address={whoisData.address}
                          onClick={() =>
                            onSelectAddress({ address: whoisData.address })
                          }
                          name={whoisData.name}
                        />
                      </>
                    ) : (
                      <>
                        <ListSubheader sx={{ px: 3 }}>Search Results</ListSubheader>
                        <ListItem sx={LIST_ITEM_STYLE}>
                          <ListItemText translate="yes" primary="No results found" />
                        </ListItem>
                      </>
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
                    <ListItemText
                      data-cy={"no-address-book-results"}
                      translate="yes"
                      primary="No results"
                    />
                  </ListItem>
                )}
              </>
            )}
            {/* EFP Followings will be displayed where the address book is displayed */}
            {showAddressBook && (
              <>
                <ListSubheader sx={{ px: 3 }}>Onchain Friends | EFP Followings</ListSubheader>
                {followingLoading ? <ListItem sx={{ ...LIST_ITEM_STYLE, gap: 2 }}>
                  <Skeleton variant="rounded" width={36} height={36} />
                  <Skeleton variant="text" width="100%" height={28} />
                </ListItem> : followingList.length > 0 ? (
                  followingList
                ) : (
                  <ListItem sx={LIST_ITEM_STYLE}>
                    <ListItemText
                      data-cy={"no-address-book-results"}
                      translate="yes"
                      primary="No results"
                    />
                  </ListItem>
                )}
              </>
            )}
          </List>
        )}
        {mode === "addressBook" && (
          <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
            <Button
              data-cy={"save-button"}
              loading={isContractDetectionLoading || whoisQuery.isFetching}
              disabled={
                isContractDetectionLoading ||
                !Boolean(searchTermVisible) ||
                !(whoisData || checksummedSearchedAddress)
              }
              fullWidth
              variant="contained"
              onClick={() => {
                onSelectAddress({
                  address:
                    whoisData?.address ??
                    checksummedSearchedAddress!,
                  associatedNetworks: contractData?.isContract
                    ? contractData.associatedNetworks
                    : selectedNetworks.map(({ id }) => id),
                  name,
                  isContract: contractData?.isContract,
                });
              }}
            >
              Save
            </Button>
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
