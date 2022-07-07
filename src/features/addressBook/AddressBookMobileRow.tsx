import { ListItemText, Stack, TableCell, TableRow } from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
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
          <AddressAvatar
            address={address}
            AvatarProps={{
              sx: { width: "27px", height: "27px" },
            }}
            BlockiesProps={{ size: 9, scale: 3 }}
          />
          <ListItemText
            primary={<AddressName address={address} length="short" />}
            secondary={!!name && shortenHex(address, 4)}
            primaryTypographyProps={{ variant: "h6" }}
          />
        </Stack>
      </TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
};

export default AddressBookMobileRow;
