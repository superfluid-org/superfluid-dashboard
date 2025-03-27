import {
  Box,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
} from "@mui/material";

const AddressBookLoadingRow = () => {
  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={2}>
          <Skeleton variant="rectangular" width="34px" height="27px" sx={{ borderRadius: "30%" }} />
          <Skeleton variant="text" width="100%" height="26px" />
        </Stack>
      </TableCell>

      <TableCell data-cy={"actual-address"}>
        <Stack direction="column">
          <Skeleton variant="text" width="100%" height="28px" />
        </Stack>
      </TableCell>

      <TableCell>
        <Box
          data-cy="networks"
          sx={{ overflow: "auto", scrollbarWidth: "none" }}
        >
          <Skeleton variant="rounded" width="24px" height="24px" sx={{ transform: `translateX(${0}px) translateY(${24}px)` }} />
          <Skeleton variant="rounded" width="24px" height="24px" sx={{ transform: `translateX(${16}px) translateY(${0}px)` }} />
          <Skeleton variant="rounded" width="24px" height="24px" sx={{ transform: `translateX(${32}px) translateY(${-24}px)` }} />
        </Box>
      </TableCell>

      <TableCell data-cy={"active-streams"}>
        <Skeleton width="30px" />
      </TableCell>

      <TableCell data-cy={"active-streams"}>
        {/* <Skeleton width="30px" /> */}
      </TableCell>
    </TableRow>
  );
};

export default AddressBookLoadingRow;
