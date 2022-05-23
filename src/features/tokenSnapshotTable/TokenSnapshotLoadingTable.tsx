import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import ExpandCircleDownOutlinedIcon from "@mui/icons-material/ExpandCircleDownOutlined";
import {
  Avatar,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import { FC } from "react";

const SnapshotRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Stack direction="row" gap={2}>
        <Skeleton variant="circular" width={36} height={36} />
        <Box>
          <Skeleton width={80} />
          <Skeleton width={40} />
        </Box>
      </Stack>
    </TableCell>
    <TableCell>
      <Skeleton width={120} />
      <Skeleton width={40} />
    </TableCell>
    <TableCell>
      <Skeleton width={120} />
    </TableCell>
    <TableCell>
      <Skeleton width={120} />
      <Skeleton width={120} />
    </TableCell>
    <TableCell>
      <Skeleton variant="circular" width={24} height={24} />
    </TableCell>
  </TableRow>
);

const TokenSnapshotLoadingTable = () => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell colSpan={5} sx={{ border: "none", p: 0 }}>
            <Stack
              direction="row"
              alignItems="center"
              gap={2}
              sx={{ py: 3, px: 4 }}
            >
              <Skeleton variant="circular" width={36} height={36} />

              <Typography variant="h5">
                <Skeleton variant="text" width={200} />
              </Typography>
            </Stack>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Asset</TableCell>
          <TableCell width="300px">Balance</TableCell>
          <TableCell width="300px">Net Flow</TableCell>
          <TableCell width="300px">Inflow/Outflow</TableCell>
          <TableCell width="40px" align="center">
            <KeyboardDoubleArrowDownIcon />
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <SnapshotRowSkeleton />
        <SnapshotRowSkeleton />
        <SnapshotRowSkeleton />
        <SnapshotRowSkeleton />
        <SnapshotRowSkeleton />
      </TableBody>
    </Table>
  </TableContainer>
);

export default TokenSnapshotLoadingTable;
