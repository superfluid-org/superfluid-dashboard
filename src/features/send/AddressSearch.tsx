import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import { Button, ButtonProps, IconButton } from "@mui/material";
import { memo, MouseEvent, useState } from "react";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName, {
  AddressNameProps,
} from "../../components/AddressName/AddressName";
import AddressSearchDialog from "../../components/AddressSearchDialog/AddressSearchDialog";
import { AddressSearchDialogProps } from "../../components/AddressSearchDialog/AddressSearchDialog";

export default memo(function AddressSearch({
  address,
  onChange,
  placeholder = "Public Address, ENS domain or Farcaster handle",
  addressLength = "long",
  ButtonProps = {},
  onBlur = () => { },
  AddressSearchDialogProps = {},
}: {
  address: string | null;
  onChange: (address: string | null) => void; // TODO(KK): better name
  placeholder?: string;
  addressLength?: AddressNameProps["length"];
  ButtonProps?: ButtonProps;
  onBlur?: () => void;
  AddressSearchDialogProps?: Partial<
    Omit<AddressSearchDialogProps, "open" | "onClose" | "onSelectAddress">
  >;
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

  const onSelectAddress = ({ address }: { address: string }) => {
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
          <span translate="no" style={{ overflow: "hidden" }}>
            <AddressName address={address} length={addressLength} />
          </span>
        ) : (
          <span translate="yes">{placeholder}</span>
        )}
      </Button>

      <AddressSearchDialog
        title="Select a receiver"
        {...AddressSearchDialogProps}
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
