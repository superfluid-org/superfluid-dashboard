import {
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
  useMediaQuery,
  useTheme,
} from "@mui/material";

export const SnapshotRowSkeleton = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <TableRow data-cy={"loading-skeletons"}>
      <TableCell>
        <Stack direction="row" gap={2}>
          <Skeleton variant="circular" width={36} height={36} />
          <Stack justifyContent="center">
            {!isBelowMd && <Skeleton width={40} />}
          </Stack>
        </Stack>
      </TableCell>
      {!isBelowMd ? (
        <>
          <TableCell>
            <Stack direction="row" gap={2}>
              <Skeleton variant="circular" width={36} height={36} />
              <Stack justifyContent="center">
                {!isBelowMd && <Skeleton width={80} />}
              </Stack>
            </Stack>
          </TableCell>
          <TableCell>
            <Skeleton width={80} />
          </TableCell>
          <TableCell>
            <Skeleton width={60} />
            <Skeleton width={60} />
            <Skeleton width={60} />
          </TableCell>
        </>
      ) : (
        <TableCell>
          <Stack alignItems="end">
            <Skeleton width={60} />
          </Stack>
        </TableCell>
      )}
      <TableCell>
        <Skeleton width={80} />
      </TableCell>
      <TableCell>
        <Stack direction="column" alignItems="center" gap={0.8}>
          <Skeleton variant="rectangular" width={104} height={40} />
        </Stack>
      </TableCell>
    </TableRow>
  );
};

const TokenAccessLoadingTable = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <TableContainer
      component={Paper}
      sx={{
        [theme.breakpoints.down("md")]: {
          mx: -2,
          width: "auto",
          borderRadius: 0,
          border: "none",
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: "none",
        },
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              colSpan={5}
              sx={{
                p: 0,
                [theme.breakpoints.up("md")]: { border: "none" },
                [theme.breakpoints.down("md")]: { p: 0 },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                gap={2}
                sx={{ py: 2, px: 4, [theme.breakpoints.down("md")]: { p: 2 } }}
              >
                <Skeleton variant="circular" width={36} height={36} />

                <Typography variant="h5">
                  <Skeleton variant="text" width={200} />
                </Typography>
              </Stack>
            </TableCell>
          </TableRow>
          {!isBelowMd && (
            <TableRow>
              <TableCell width="136px" sx={{ pl: 5 }}>
                Asset
              </TableCell>
              <TableCell width="183px">Address</TableCell>
              <TableCell width="186px">Token Allowance</TableCell>
              <TableCell width="183px">Stream Permissions</TableCell>
              <TableCell width="232px">Stream Allowance</TableCell>
              <TableCell width="148px">Actions</TableCell>
            </TableRow>
          )}
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
};

export default TokenAccessLoadingTable;
