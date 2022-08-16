import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import { Button, ButtonProps, IconButton } from "@mui/material";
import { memo, MouseEvent, useState } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName, {
  AddressNameProps,
} from "../../components/AddressName/AddressName";
import AddressSearchDialog from "../../components/AddressSearchDialog/AddressSearchDialog";
import AddressSearchIndex from "./AddressSearchIndex";

export default memo(function AddressSearch({
  address,
  onChange,
  placeholder = "Public Address or ENS",
  addressLength = "long",
  ButtonProps = {},
  onBlur = () => {},
}: {
  address: string | null;
  onChange: (address: string | null) => void; // TODO(KK): better name
  placeholder?: string;
  addressLength?: AddressNameProps["length"];
  ButtonProps?: ButtonProps;
  onBlur?: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const onOpenDialog = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setDialogOpen(true);
  };

  const clearSearch = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    onChange(null);
  };

  const onSelectAddress = (address: string) => {
    setDialogOpen(false);
    onChange(address);
    onBlur();
  };

  return (
    <>
      <Button
        data-cy={"address-button"}
        variant="input"
        onClick={onOpenDialog}
        startIcon={
          address ? <AddressAvatar address={address} /> : <SearchIcon />
        }
        endIcon={
          address ? (
            <IconButton
              // Using span here because button can not be inside another button
              component="span"
              onClick={clearSearch}
              color="inherit"
              sx={{ marginLeft: "auto", marginRight: "-6px" }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </IconButton>
          ) : (
            <KeyboardArrowDownIcon />
          )
        }
        {...ButtonProps}
      >
        {address ? (
          <AddressName address={address} length={addressLength} />
        ) : (
          placeholder
        )}
      </Button>

      <AddressSearchDialog
        title={"Select a receiver"}
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
