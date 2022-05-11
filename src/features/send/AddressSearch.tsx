import { TextField } from "@mui/material";
import { memo, useState } from "react";
import { useStateWithDep } from "../../useStateWithDep";
import DisplayAddressChip, { DisplayAddress } from "./DisplayAddressChip";
import AddressSearchDialog from "./AddressSearchDialog";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
export default memo(function AddressSearch({
  onChange,
  ...props
}: {
  address: DisplayAddress | undefined;
  onChange: (address: DisplayAddress | undefined) => void; // TODO(KK): better name19
}) {
  const [address, setAddress] = useStateWithDep<DisplayAddress | undefined>(
    props.address
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <TextField
        fullWidth
        placeholder="Public Address or ENS"
        InputProps={{
          startAdornment: address && (
            <DisplayAddressChip
              hash={address.hash}
              name={address.name}
              tryGetEns={false}
              ChipProps={{
                onDelete: () => setAddress(undefined),
              }}
            />
          ),
          endAdornment: <KeyboardArrowDownIcon />,
        }}
        onClick={() => setDialogOpen(true)}
        onChange={() => setDialogOpen(true)}
      />
      <AddressSearchDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelectAddress={(address) => {
          setAddress(address);
          setDialogOpen(false);
          onChange(address);
        }}
      />
    </>
  );
});
