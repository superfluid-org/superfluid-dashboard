import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Button, ButtonProps, IconButton } from "@mui/material";
import { memo, MouseEvent, useState } from "react";
import Blockies from "react-blockies";
import AddressName from "../../components/AddressName/AddressName";
import AddressSearchDialog from "../../components/AddressSearchDialog/AddressSearchDialog";
import useAddressName from "../../hooks/useAddressName";
import AddressSearchIndex from "./AddressSearchIndex";

export default memo(function AddressSearch({
  address,
  onChange,
  placeholder = "Public Address or ENS",
  ButtonProps = {},
  onBlur = () => {},
}: {
  address: string | null;
  onChange: (address: string | null) => void; // TODO(KK): better name
  placeholder?: string;
  ButtonProps?: ButtonProps;
  onBlur?: () => void;
}) {
  const addressName = useAddressName(address || "");

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
          address ? (
            <Avatar variant="rounded">
              <Blockies
                seed={addressName.addressChecksummed}
                size={12}
                scale={3}
              />
            </Avatar>
          ) : (
            <SearchIcon />
          )
        }
        endIcon={
          address ? (
            <IconButton
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
        {address ? <AddressName address={address} /> : placeholder}
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
