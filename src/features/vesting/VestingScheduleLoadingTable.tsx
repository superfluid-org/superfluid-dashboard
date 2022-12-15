import {
  ListItemText,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const VestingScheduleRowSkeleton = () => {
  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="rectangular" width={36} height={36} />
          <Typography variant="h7">
            <Skeleton width={80} />
          </Typography>
        </Stack>
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Skeleton variant="circular" width={36} height={36} />
          <ListItemText primary={<Skeleton width={80} />} />
        </Stack>
      </TableCell>
      <TableCell>
        <ListItemText
          primary={<Skeleton width={80} />}
          secondary={<Skeleton width={80} />}
        />
      </TableCell>
      <TableCell>
        <ListItemText
          primary={<Skeleton width={80} />}
          secondary={<Skeleton width={80} />}
          primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
        />
      </TableCell>
    </TableRow>
  );
};

const VestingScheduleLoadingTable = () => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell sx={{ pl: 8.5 }}>Receiver</TableCell>
          <TableCell>Total vesting</TableCell>
          <TableCell>Cliff</TableCell>
          <TableCell>Start / End</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <VestingScheduleRowSkeleton />
        <VestingScheduleRowSkeleton />
        <VestingScheduleRowSkeleton />
      </TableBody>
    </Table>
  );
};

export default VestingScheduleLoadingTable;
