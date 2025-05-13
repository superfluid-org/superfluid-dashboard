import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
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
import { skipToken } from "@reduxjs/toolkit/query";
import ScheduledWrapRow from "./ScheduledWrapRow";
import TooltipWithIcon from "../common/TooltipWithIcon";
import { AutoWrapContractInfo } from "../vesting/VestingScheduleTables";
import { PlatformWhitelistedStatus } from "./ScheduledWrapTables";
import ScheduledWrapLoadingTable from "./ScheduledWrapLoadingTable";
import { EMPTY_ARRAY } from "../../utils/constants";
import { useWhitelist } from "../../hooks/useWhitelist";

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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { wrapSchedules, isLoading } =
    autoWrapSubgraphApi.useGetWrapSchedulesQuery(
      address
        ? {
          chainId: network.id,
          where: { account: address.toLowerCase(), isActive: true },
          orderBy: "createdAt",
          orderDirection: "desc",
        }
        : skipToken,
      {
        selectFromResult: (result) => ({
          ...result,
          wrapSchedules:
            result.data?.wrapSchedules ?? EMPTY_ARRAY,
        }),
      }
    );

  const paginatedWrapSchedules = useMemo(
    () => wrapSchedules.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [page, rowsPerPage, wrapSchedules.length]
  );

  const { isPlatformWhitelisted, isWhitelistLoading } = useWhitelist({ accountAddress: address, network });

  const hasContent = !!wrapSchedules.length;
  useEffect(() => {
    fetchingCallback(network.id, {
      isLoading,
      hasContent,
    });
  }, [network.id, isLoading, hasContent, fetchingCallback]);

  useEffect(() => {
    whitelistedCallback(network.id, {
      isLoading: isWhitelistLoading,
      isWhitelisted: !!isPlatformWhitelisted,
    });
  }, [isWhitelistLoading, isPlatformWhitelisted, whitelistedCallback, network.id]);

  const handleChangePage = (_e: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage =
    (event: ChangeEvent<HTMLInputElement>) => {
      const newRowsPerPage = rowsPerPage === -1 ? wrapSchedules.length : parseInt(event.target.value, 10);
      setRowsPerPage(newRowsPerPage);
      setPage(0);
    };

  if (isLoading) return <ScheduledWrapLoadingTable />;
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
                    Underlying Token Allowance
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
          rowsPerPageOptions={[5, 10, 25, { value: wrapSchedules.length, label: 'All' }]}
          component="div"
          count={wrapSchedules.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            "> *": {
              visibility:
                wrapSchedules.length <= rowsPerPage ? "hidden" : "visible",
            },
          }}
        />
      </TableContainer>
      <AutoWrapContractInfo network={network} />
    </>
  );
};

export default memo(ScheduledWrapTable);
