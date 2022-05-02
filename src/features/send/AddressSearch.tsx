import { TextField } from "@mui/material";
import { memo, useEffect, useState } from "react";
import AddressSearchDialog from "./AddressSearchDialog";

export type Address = {
  hash: string;
};

export default memo(function AddressSearch({
  onChange,
}: {
  onChange: (address: Address | undefined) => void;
}) {
  const [address, setAddress] = useState<Address | undefined>();
  useEffect(() => onChange(address), [address]);

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <TextField
        label="Receiver"
        value={address?.hash}
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
