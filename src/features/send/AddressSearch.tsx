import { TextField } from "@mui/material";
import { memo, useState } from "react";
import { useStateWithDep } from "../../useStateWithDep";
import AddressChip from "./AddressChip";
import AddressSearchDialog from "./AddressSearchDialog";

export type DisplayAddress = {
  hash: string;
  name?: string;
};

export default memo(function AddressSearch({
  onChange,
  ...props
}: {
  address: DisplayAddress | undefined;
  onChange: (address: DisplayAddress | undefined) => void;
}) {
  const [address, setAddress] = useStateWithDep<DisplayAddress | undefined>(props.address);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <TextField
        label="Receiver"
        InputProps={{
          startAdornment: address ? (
            <AddressChip
              hash={address.hash}
              name={address.name}
              tryGetEns={false}
              ChipProps={{
                onDelete: () => setAddress(undefined),
              }}
            />
          ) : null,
        }}
        value={""}
        onClick={() => setDialogOpen(true)}
        onChange={() => setDialogOpen(true)}
      />
      <AddressSearchDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelectAddress={(address) => {
          setAddress(address);
          setDialogOpen(false);
        }}
      />
    </>
  );
});
