import { TextField } from "@mui/material";
import { memo, useEffect, useState } from "react";
import AddressSearchDialog from "./AddressSearchDialog";

export type Address = {
  hash: string;
  name: string;
};

export default memo(function AddressSearch({
  onChange,
}: {
  address: Address | undefined;
  onChange: (address: Address | undefined) => void;
}) {
  const [address, setAddress] = useState<Address | undefined>();
  useEffect(() => onChange(address), [address]);

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <TextField
        label="Receiver"
        value={address?.name ?? ""}
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
