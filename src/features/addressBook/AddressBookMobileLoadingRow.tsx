import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import IndeterminateCheckBoxIcon from "@mui/icons-material/IndeterminateCheckBox";
import {
  Checkbox,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
} from "@mui/material";

const AddressBookMobileLoadingRow = () => {
  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Skeleton variant="rectangular" width="34px" height="27px" sx={{ borderRadius: "30%" }} />
          <Skeleton variant="text" width="100%" height="26px" />
        </Stack>
      </TableCell>
      <TableCell width="64px">
      </TableCell>
    </TableRow>
  );
};

export default AddressBookMobileLoadingRow;
