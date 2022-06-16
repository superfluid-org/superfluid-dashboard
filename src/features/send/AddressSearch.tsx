import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Button, ButtonProps, IconButton } from "@mui/material";
import { memo, MouseEvent, useState } from "react";
import Blockies from "react-blockies";
import shortenAddress from "../../utils/shortenAddress";
import AddressSearchDialog from "./AddressSearchDialog";
import { DisplayAddress } from "./DisplayAddressChip";

export default memo(function AddressSearch({
  address,
  onChange,
  placeholder = "Public Address or ENS",
  shortenAddr,
  ButtonProps = {},
  onBlur = () => {},
}: {
  address: DisplayAddress | null;
  onChange: (address: DisplayAddress | null) => void; // TODO(KK): better name
  placeholder?: string;
  shortenAddr?: number;
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

  return (
    <>
      <Button
        data-cy={"address-button"}
        variant="input"
        onClick={onOpenDialog}
        startIcon={
          address ? (
            <Avatar variant="rounded">
              <Blockies seed={address.hash} size={12} scale={3} />
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
        <span>
          {address
            ? shortenAddr
              ? shortenAddress(address.hash, shortenAddr)
              : address.hash
            : placeholder}
        </span>
      </Button>

      <AddressSearchDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          onBlur();
        }}
        onSelectAddress={(address) => {
          setDialogOpen(false);
          onChange(address);
          onBlur();
        }}
      />
    </>
  );
});
