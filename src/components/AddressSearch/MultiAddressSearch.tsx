import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  ButtonProps,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
} from "@mui/material";
import { memo, MouseEvent, useState } from "react";
import AddressName, {
  AddressNameProps,
} from "../../components/AddressName/AddressName";
import AddressSearchDialog from "../../components/AddressSearchDialog/AddressSearchDialog";
import AddressSearchIndex from "../../features/send/AddressSearchIndex";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddressAvatar from "../Avatar/AddressAvatar";

interface MultiAddressSearchProps {
  addresses: string[];
  onChange: (addresses: string[]) => void; // TODO(KK): better name
  placeholder?: string;
  dialogTitle?: string;
  addressLength?: AddressNameProps["length"];
  ButtonProps?: ButtonProps;
  onBlur?: () => void;
}

export default memo(function MultiAddressSearch({
  addresses,
  onChange,
  placeholder = "Public Address or ENS",
  dialogTitle = "Select a receiver",
  addressLength = "long",
  ButtonProps = {},
  onBlur = () => {},
}: MultiAddressSearchProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const onOpenDialog = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDialogOpen(true);
  };

  const clearSearch = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    onChange([]);
  };

  const onSelectAddress = (address: string) => {
    setDialogOpen(false);
    onChange([...addresses, address]);
    onBlur();
  };

  const removeAddress = (address: string) => () => {
    onChange(
      addresses.filter((existingAddress) => existingAddress !== address)
    );
  };

  return (
    <>
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

      {addresses.length > 0 && (
        <List>
          {addresses.map((address) => (
            <ListItem key={address} sx={{ px: 1 }}>
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
              <IconButton onClick={removeAddress(address)} size="small">
                <CloseRoundedIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}

      <AddressSearchDialog
        title={dialogTitle}
        index={<AddressSearchIndex onSelectAddress={onSelectAddress} />}
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
