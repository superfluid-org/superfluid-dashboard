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

const SnapshotRowSkeleton = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <TableRow data-cy={"loading-skeletons"}>
      <TableCell>
        <Stack
          direction="row"
          sx={{
            gap: 2,
          }}
        >
          <Skeleton variant="circular" width={36} height={36} />
          <Stack
            sx={{
              justifyContent: "center",
            }}
          >
            {!isBelowMd && <Skeleton width={80} />}
            <Skeleton width={40} />
          </Stack>
        </Stack>
      </TableCell>
      {!isBelowMd ? (
        <>
          <TableCell>
            <Skeleton width={80} />
            <Skeleton width={40} />
          </TableCell>
          <TableCell>
            <Skeleton width={80} />
          </TableCell>
          <TableCell sx={{ pl: 0 }}>
            <Skeleton width={60} />
            <Skeleton width={60} />
          </TableCell>
        </>
      ) : (
        <TableCell>
          <Stack
            sx={{
              alignItems: "end",
            }}
          >
            <Skeleton width={60} />
            <Skeleton width={30} />
          </Stack>
        </TableCell>
      )}
      <TableCell>
        <Skeleton variant="circular" width={24} height={24} />
      </TableCell>
    </TableRow>
  );
};

const TokenSnapshotLoadingTable = () => {
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
      <Table sx={{ minWidth: { md: 1040 } }}>
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
                sx={{
                  alignItems: "center",
                  gap: 2,
                  py: 2,
                  px: 4,
                  [theme.breakpoints.down("md")]: { p: 2 },
                }}
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
              <TableCell width="22%">Asset</TableCell>
              <TableCell width="16%">Balance</TableCell>
              <TableCell width="14%">Net Flow Rate</TableCell>
              <TableCell width="40%" sx={{ pl: 0 }}>
                Actions
              </TableCell>
              <TableCell width="8%" align="center"></TableCell>
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

export default TokenSnapshotLoadingTable;
