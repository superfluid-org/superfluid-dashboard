import { ListItemText, Stack, TableCell, TableRow } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import useAddressName from "../../hooks/useAddressName";
import shortenHex from "../../utils/shortenHex";

interface AddressBookMobileRowProps {
  address: Address;
}

const AddressBookMobileRow: FC<AddressBookMobileRowProps> = ({ address }) => {
  const { name } = useAddressName(address);

  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <AddressAvatar address={address} />
          <ListItemText
            primary={name || shortenHex(address, 8)}
            secondary={!!name && shortenHex(address, 8)}
            primaryTypographyProps={{ variant: "h6" }}
          />
        </Stack>
      </TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
};

export default AddressBookMobileRow;
