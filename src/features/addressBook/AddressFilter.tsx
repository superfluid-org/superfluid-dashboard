import {
  Box,
  Button,
  Checkbox,
  Chip,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Popover,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { ChangeEvent, FC, MouseEvent, useState } from "react";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import { useAppSelector } from "../redux/store";
import { addressBookSelectors } from "./addressBook.slice";

interface AddressFilterProps {
  addressesFilter: Address[];
  onChange: (newAddresses: Address[]) => void;
}

const AddressFilter: FC<AddressFilterProps> = ({
  addressesFilter,
  onChange,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const addressBookEntries = useAppSelector((state) =>
    addressBookSelectors.searchAddressBookEntries(state, searchTerm)
  );

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const onAddressToggled = (address: Address) => () => {
    if (addressesFilter.includes(address)) {
      onChange(addressesFilter.filter((a) => a !== address));
    } else {
      onChange([...addressesFilter, address]);
    }
  };

  const removeAddress = (address: Address) => () =>
    onChange(addressesFilter.filter((a) => a !== address));

  const clearFilter = () => onChange([]);

  const openMenu = (e: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(e.currentTarget);

  const closeMenu = () => setAnchorEl(null);

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        size={isBelowMd ? "small" : "medium"}
        endIcon={<OpenIcon open={!!anchorEl} />}
        onClick={openMenu}
      >
        {addressesFilter.length > 0 ? "Selected Addresses" : "All Addresses"}
      </Button>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={closeMenu}
        PaperProps={{
          square: true,
          elevation: 2,
          sx: { mt: theme.spacing(1.5), maxWidth: "370px", width: "100%" },
        }}
        transformOrigin={{ horizontal: "left", vertical: "top" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      >
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            autoFocus
            size="small"
            onChange={onSearchChange}
            placeholder="Address or Name"
            value={searchTerm}
          />

          {addressesFilter.length > 0 && (
            <Stack gap={1} direction="row" flexWrap="wrap" sx={{ pt: 2.5 }}>
              {addressesFilter.map((address) => (
                <Chip
                  key={address}
                  color="primary"
                  label={<AddressName address={address} length="short" />}
                  size="small"
                  translate="no"
                  onDelete={removeAddress(address)}
                />
              ))}

              <Chip label="Clear All" size="small" onClick={clearFilter} />
            </Stack>
          )}
        </Box>

        <ListSubheader>Address Book</ListSubheader>
        <List>
          {addressBookEntries.map(({ address }) => (
            <ListItemButton key={address} onClick={onAddressToggled(address)}>
              <ListItemAvatar>
                <AddressAvatar address={address} />
              </ListItemAvatar>
              <ListItemText translate="no">
                <AddressName address={address} length="medium" />
              </ListItemText>

              <Checkbox
                checked={addressesFilter.includes(address)}
                sx={{ p: 1, m: -1 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
};

export default AddressFilter;
