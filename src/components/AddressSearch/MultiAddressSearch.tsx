import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  ButtonProps,
  FormGroup,
  FormHelperText,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Stack,
} from "@mui/material";
import { FC, memo, MouseEvent, useState } from "react";
import AddressName, {
  AddressNameProps,
} from "../../components/AddressName/AddressName";
import AddressSearchDialog, {
  AddressListItem,
} from "../../components/AddressSearchDialog/AddressSearchDialog";
import AddressSearchIndex from "../../features/send/AddressSearchIndex";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddressAvatar from "../Avatar/AddressAvatar";
import { Address } from "@superfluid-finance/sdk-core";

interface MultiAddressSearchProps {
  addresses: Address[];
  onChange: (addresses: Address[]) => void;
  placeholder?: string;
  dialogTitle?: string;
  helperText?: string;
  addressLength?: AddressNameProps["length"];
  ButtonProps?: ButtonProps;
  onBlur?: () => void;
  disabledAddresses?: Address[];
}

export default memo(function MultiAddressSearch({
  addresses,
  onChange,
  placeholder = "Public Address or ENS",
  dialogTitle = "Select Address(es)",
  helperText = "",
  addressLength = "long",
  ButtonProps = {},
  onBlur = () => {},
  disabledAddresses = [],
}: MultiAddressSearchProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const onOpenDialog = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDialogOpen(true);
  };

  const onSelectAddress = ({ address }: { address: string }) => {
    if (addresses.includes(address)) {
      onChange(addresses.filter((a: string) => a !== address));
    } else {
      onChange([...addresses.filter((a: string) => a !== address), address]);
    }
    onBlur();
  };

  const removeAddress = (address: string) => () => {
    onChange(
      addresses.filter((existingAddress) => existingAddress !== address)
    );
  };

  return (
    <>
      <FormGroup>
        <Button
          data-cy={"address-button"}
          variant="input"
          onClick={onOpenDialog}
          startIcon={<SearchIcon />}
          endIcon={<KeyboardArrowDownIcon />}
          {...ButtonProps}
        >
          {placeholder}
        </Button>
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormGroup>

      {addresses.length > 0 && (
        <List>
          {addresses.map((address) => (
            <ListItemButton
              data-cy="selected-address"
              key={address}
              sx={{ px: 1 }}
            >
              <ListItemAvatar>
                <AddressAvatar
                  address={address}
                  AvatarProps={{
                    sx: { width: "27px", height: "27px" },
                  }}
                  BlockiesProps={{ size: 9, scale: 3 }}
                />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <AddressName address={address} length={addressLength} />
                }
                primaryTypographyProps={{ variant: "h7" }}
              />
              <IconButton
                data-cy="remove-address-btn"
                onClick={removeAddress(address)}
                size="small"
              >
                <CloseRoundedIcon />
              </IconButton>
            </ListItemButton>
          ))}
        </List>
      )}

      <AddressSearchDialog
        disableAutoselect
        showSelected
        title={dialogTitle}
        addresses={addresses}
        disabledAddresses={disabledAddresses}
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          onBlur();
        }}
        onSelectAddress={onSelectAddress}
      />
    </>
  );
});
