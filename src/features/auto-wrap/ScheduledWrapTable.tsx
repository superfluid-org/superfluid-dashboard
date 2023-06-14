import {
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  colors,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { ChangeEvent, FC, memo, useEffect, useMemo, useState } from "react";
import NetworkHeadingRow from "../../components/Table/NetworkHeadingRow";
import { Network } from "../network/networks";
import { FetchingStatus } from "../tokenSnapshotTable/TokenSnapshotTables";
import { autoWrapSubgraphApi } from "../../auto-wrap-subgraph/autoWrapSubgraphApi";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import ScheduledWrapRow from "./ScheduledWrapRow";
import TooltipWithIcon from "../common/TooltipWithIcon";
import { AutoWrapContractInfo } from "../vesting/VestingScheduleTables";
import { PlatformWhitelistedStatus } from "./ScheduledWrapTables";
import { platformApi } from "../redux/platformApi/platformApi";

interface TokenSnapshotTableProps {
  address: Address;
  network: Network;
  fetchingCallback: (networkId: number, fetchingStatus: FetchingStatus) => void;
  whitelistedCallback: (
    networkId: number,
    status: PlatformWhitelistedStatus
  ) => void;
}

const ScheduledWrapTable: FC<TokenSnapshotTableProps> = ({
  address,
  network,
  fetchingCallback,
  whitelistedCallback,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [page, setPage] = useState({ wallet: 0, contract: 0 });
  const [rowsPerPage, setRowsPerPage] = useState({ wallet: 25, contract: 25 });

  const { wrapSchedules, isLoading } =
    autoWrapSubgraphApi.useGetWrapSchedulesQuery(
      address
        ? {
            chainId: network.id,
            where: { account: address?.toLowerCase(), deletedAt: undefined },
            orderBy: "createdAt",
            orderDirection: "desc",
          }
        : skipToken,
      {
        refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
        selectFromResult: (result) => ({
          ...result,
          wrapSchedules: result.data?.wrapSchedules ?? [],
        }),
      }
    );

  const memonizedWrapSchedules = useMemo(() => wrapSchedules, [wrapSchedules]);

  const paginatedWrapSchedules = useMemo(
    () =>
      memonizedWrapSchedules.slice(
        page.contract * rowsPerPage.contract,
        (page.contract + 1) * rowsPerPage.contract
      ),
    [page.contract, rowsPerPage, memonizedWrapSchedules]
  );

  const { isPlatformWhitelisted, isLoading: isWhitelistLoading } =
    platformApi.useIsAccountWhitelistedQuery(
      address && network?.platformUrl
        ? {
            chainId: network.id,
            baseUrl: network.platformUrl,
            account: address?.toLowerCase(),
          }
        : skipToken,
      {
        selectFromResult: (queryResult) => ({
          ...queryResult,
          isPlatformWhitelisted: !!queryResult.data,
        }),
      }
    );

  useEffect(() => {
    fetchingCallback(network.id, {
      isLoading: isLoading,
      hasContent: !!wrapSchedules.length,
    });
  }, [network.id, isLoading, wrapSchedules.length, fetchingCallback]);

  useEffect(() => {
    whitelistedCallback(network.id, {
      isLoading: isWhitelistLoading,
      isWhitelisted: isPlatformWhitelisted,
    });
  }, [isWhitelistLoading, isPlatformWhitelisted, whitelistedCallback]);

  const handleChangePage =
    (table: "schedules") => (_e: unknown, newPage: number) => {
      setPage((page) => ({ ...page, [table]: newPage }));
    };

  const handleChangeRowsPerPage =
    (table: "schedules") => (event: ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage((rowsPerPage) => ({
        ...rowsPerPage,
        [table]: parseInt(event.target.value, 10),
      }));
      setPage((page) => ({ ...page, address: 0 }));
    };

  if (!isLoading && wrapSchedules.length === 0) return null;

  return (
    <>
      <TableContainer
        data-cy={network.slugName + "-token-snapshot-table"}
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
            <NetworkHeadingRow colSpan={5} network={network} />
            {!isBelowMd && (
              <TableRow>
                <TableCell width="200">
                  <Stack direction="row" gap={0.5} alignItems="center">
                    Asset
                  </Stack>
                </TableCell>
                <TableCell width="300">
                  <Stack direction="row" gap={0.5} alignItems="center">
                    ERC-20 Allowance
                    <TooltipWithIcon
                      title="The allowance cap you’ve set up for the underlying ERC-20 tokens."
                      IconProps={{
                        sx: {
                          fontSize: "16px",
                          color: colors.grey[700],
                        },
                      }}
                    />
                  </Stack>
                </TableCell>
                <TableCell width="300">
                  <Stack direction="row" gap={0.5} alignItems="center">
                    Lower Limit
                    <TooltipWithIcon
                      title="The amount of time left until your stream hits zero at which an automatic top up should be triggered."
                      IconProps={{
                        sx: {
                          fontSize: "16px",
                          color: colors.grey[700],
                        },
                      }}
                    />
                  </Stack>
                </TableCell>
                <TableCell width="300">
                  <Stack direction="row" gap={0.5} alignItems="center">
                    Upper Limit
                    <TooltipWithIcon
                      title="The amount of time worth of streaming that the wrapped tokens will cover."
                      IconProps={{
                        sx: {
                          fontSize: "16px",
                          color: colors.grey[700],
                        },
                      }}
                    />
                  </Stack>
                </TableCell>
                <TableCell width="200" align="center">
                  Actions
                </TableCell>
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {paginatedWrapSchedules.map((schedule) => (
              <ScheduledWrapRow
                key={schedule.id}
                network={network}
                schedule={schedule}
              />
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={memonizedWrapSchedules.length}
          rowsPerPage={rowsPerPage.wallet}
          page={page.wallet}
          onPageChange={handleChangePage("schedules")}
          onRowsPerPageChange={handleChangeRowsPerPage("schedules")}
          sx={{
            "> *": {
              visibility:
                memonizedWrapSchedules.length <= rowsPerPage.wallet
                  ? "hidden"
                  : "visible",
            },
          }}
        />
      </TableContainer>
      <AutoWrapContractInfo network={network} />
    </>
  );
};

export default memo(ScheduledWrapTable);
