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
import {
  FC,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { wagmiRpcProvider } from "../../features/wallet/WagmiManager";
import { allNetworks, Network } from "../../features/network/networks";
import NetworkSelect from "../NetworkSelect/NetworkSelect";
import { LoadingButton } from "@mui/lab";

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
  index: ReactNode | null;
  addresses?: Address[];
  onClose?: () => void;
  onBack?: () => void;
  onSelectAddress: (...params: AddressBookEntry[]) => void;
  showAddressBook?: boolean;
  disableAutoselect?: boolean;
  disabledAddresses?: Address[];
  showSelected?: boolean;
};

export const AddressSearchDialogContent: FC<AddressSearchDialogProps> = ({
  open,
  addresses = [],
  onSelectAddress,
  onClose,
  onBack,
  title,
  index,
  showAddressBook = true,
  disableAutoselect = false,
  disabledAddresses = [],
  showSelected = false,
}) => {
  const theme = useTheme();

  const [searchTermVisible, setSearchTermVisible] = useState("");
  const [selectedNetworks, setSelectedNetworks] = useState<Network[]>([]);
  const [name, setName] = useState("");
  const [foundContracts, setFoundContracts] = useState<
    { address: string; network: Network; code: string }[]
  >([]);
  const [isContractDetectionLoading, setIsContractDetectionLoading] =
    useState(false);
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

  useEffect(() => {
    const effect = async () => {
      const searchTermTrimmed = searchTermVisible.trim();

      if (!searchTermTrimmed || !isAddress(searchTermTrimmed)) return;
      setIsContractDetectionLoading(true);
      const result = (
        await Promise.all(
          allNetworks.map(async (network) => {
            const provider = wagmiRpcProvider({ chainId: network.id });

            const code = await provider.getCode(searchTermTrimmed);

            return {
              network,
              code,
              address: searchTermTrimmed,
            };
          })
        )
      ).filter(({ code }) => code !== "0x");

      setIsContractDetectionLoading(false);
      setFoundContracts(result);
    };
    effect();
  }, [searchTermVisible]);

  const [openCounter, setOpenCounter] = useState(0);

  useEffect(() => {
    if (open) {
      setOpenCounter(openCounter + 1);
      setSearchTermVisible(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
      setSearchTermDebounced(""); // Reset the search term when the dialog opens, not when it closes (because then there would be noticable visual clearing of the field). It's smoother UI to do it on opening.
      setFoundContracts([]);
      setSelectedNetworks([]);
      setName("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const addressBookResults = useAppSelector((state) =>
    addressBookSelectors.searchAddressBookEntries(state, searchTermDebounced)
  );

  const checksummedSearchedAddress = useMemo(() => {
    if (!!searchTermDebounced && isAddress(searchTermDebounced)) {
      return getAddress(searchTermDebounced);
    }
    return null;
  }, [searchTermDebounced]);

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
              {foundContracts.length > 0 ? "Contract " : ""} Address
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
          <Stack>
            <Typography sx={{ m: 1 }} variant="h6">
              Name
            </Typography>
            <TextField
              data-cy={"name-dialog-input"}
              autoComplete="off"
              fullWidth
              autoFocus
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
                foundContracts.length === 0
                  ? selectedNetworks
                  : foundContracts.map(({ network }) => network)
              }
              onSelect={setSelectedNetworks}
              readonly={foundContracts.length > 0}
            />
          </Stack>
        </Stack>
      </DialogTitle>
      <DialogContent dividers={false} sx={{ p: 0 }}>
        {!searchTermVisible ? (
          index
        ) : (
          <List sx={{ pt: 0, pb: 0 }}>
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
                    onClick={() => onSelectAddress({ address })}
                    namePlaceholder={name}
                  />
                ))}
              </>
            )}
          </List>
        )}
        <Box sx={{ p: 2, display: "flex", justifyContent: "center" }}>
          <LoadingButton
            loading={isContractDetectionLoading}
            disabled={isContractDetectionLoading || !Boolean(searchTermVisible)}
            sx={{ width: 400 }}
            variant="contained"
            onClick={() => {
              onSelectAddress({
                address:
                  foundContracts[0]?.address ?? checksummedSearchedAddress,
                associatedNetworks:
                  foundContracts.length > 0
                    ? foundContracts.map(({ network }) => network.id)
                    : selectedNetworks.map(({ id }) => id),
                name,
                isContract: foundContracts.length > 0,
              });
            }}
          >
            Save
          </LoadingButton>
        </Box>
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
  index,
  showAddressBook,
  disableAutoselect,
  disabledAddresses,
  showSelected,
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
        index={index}
        showAddressBook={showAddressBook}
        disableAutoselect={disableAutoselect}
        disabledAddresses={disabledAddresses}
        showSelected={showSelected}
        onSelectAddress={onSelectAddress}
        onClose={onClose}
        onBack={onBack}
      />
    </ResponsiveDialog>
  );
});
