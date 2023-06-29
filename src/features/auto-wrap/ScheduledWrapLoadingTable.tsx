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

export const ScheduledWrapRowSkeleton = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <TableRow data-cy={"loading-skeletons"}>
      <TableCell>
        <Stack direction="row" gap={2}>
          <Skeleton variant="circular" width={36} height={36} />
          <Stack justifyContent="center">
            {!isBelowMd && <Skeleton width={80} />}
          </Stack>
        </Stack>
      </TableCell>
      {!isBelowMd ? (
        <>
          <TableCell>
            <Skeleton width={80} />
          </TableCell>
          <TableCell>
            <Skeleton width={80} />
          </TableCell>
          <TableCell>
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
        <Skeleton variant="rectangular" width={116} height={22} />
      </TableCell>
    </TableRow>
  );
};

const ScheduledWrapLoadingTable = () => {
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
              <TableCell width="200">Asset</TableCell>
              <TableCell width="300">Underlying Token Allowance</TableCell>
              <TableCell width="300">Lower Limit</TableCell>
              <TableCell width="120" align="center">
                Upper Limit
              </TableCell>
              <TableCell width="120" align="center">
                Actions
              </TableCell>
            </TableRow>
          )}
        </TableHead>
        <TableBody>
          <ScheduledWrapRowSkeleton />
          <ScheduledWrapRowSkeleton />
          <ScheduledWrapRowSkeleton />
          <ScheduledWrapRowSkeleton />
          <ScheduledWrapRowSkeleton />
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ScheduledWrapLoadingTable;
