import CancelIcon from "@mui/icons-material/Cancel";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import EditIcon from "@mui/icons-material/Edit";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import {
  Checkbox,
  ListItemText,
  Stack,
  TableCell,
  TableRow,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC } from "react";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import useAddressName from "../../hooks/useAddressName";
import shortenHex from "../../utils/shortenHex";

interface AddressBookMobileRowProps {
  address: Address;
  selectable: boolean;
  selected: boolean;
  onSelect: (isSelected: boolean) => void;
}

const AddressBookMobileRow: FC<AddressBookMobileRowProps> = ({
  address,
  selectable,
  selected,
  onSelect,
}) => {
  const { name } = useAddressName(address);

  const onSelectedChange = (_event: unknown, newSelected: boolean) =>
    onSelect(newSelected);

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
      <TableCell width="64px">
        {selectable && (
          <Checkbox
            checked={selected}
            color="error"
            icon={<CheckBoxOutlineBlankIcon />}
            checkedIcon={<IndeterminateCheckBoxIcon />}
            onChange={onSelectedChange}
            sx={{ p: 1, m: -1 }}
          />
        )}
      </TableCell>
    </TableRow>
  );
};

export default AddressBookMobileRow;
