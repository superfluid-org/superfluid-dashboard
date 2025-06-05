import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { Address } from "@superfluid-finance/sdk-core";
import {
  Paper,
  TableContainer,
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Stack,
  colors,
} from "@mui/material";
import TokenAccessRow from "./TokenAccessRow";
import { FetchingStatus } from "./TokenAccessTables";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import NetworkHeadingRow from "../../components/Table/NetworkHeadingRow";
import TokenAccessLoadingTable from "./TokenAccessLoadingTable";
import TooltipWithIcon from "../common/TooltipWithIcon";
import { EMPTY_ARRAY } from "../../utils/constants";

interface Props {
  address: Address;
  network: Network;
  fetchingCallback: (networkId: number, fetchingStatus: FetchingStatus) => void;
}

export function TokenAccessTable({
  address,
  network,
  fetchingCallback,
} : Props) {
  const { flowOperators, isLoading, ...flowOperatorsQuery } = subgraphApi.useFlowOperatorsQuery(
    {
      chainId: network.id,
      filter: {
        and: [
          { sender: address.toLowerCase() },
          {
            or: [
              { allowance_not: "0" },
              { flowRateAllowanceRemaining_not: "0" },
              { permissions_not: 0 },
            ],
          },
        ],
      },
      pagination: {
        take: Infinity
      },
    },
    {
      refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
      selectFromResult: (result) => ({
        ...result,
        flowOperators: result.currentData?.items ?? EMPTY_ARRAY,
      }),
    }
  );

  const theme = useTheme();

  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const hasContent = flowOperators.length > 0;
  useEffect(() => {
    fetchingCallback(network.id, {
      isLoading,
      hasContent,
    });
  }, [
    network.id,
    isLoading,
    hasContent,
    fetchingCallback,
  ]);

  const handleChangePage = (_e: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage =
    (event: ChangeEvent<HTMLInputElement>) => {
      const newRowsPerPage = rowsPerPage === -1 ? flowOperators.length : parseInt(event.target.value, 10);
      setRowsPerPage(newRowsPerPage);
      setPage(0);
    };

  const paginatedRecords = useMemo(
    () => flowOperators.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [page, rowsPerPage, flowOperators]
  );

  if (isLoading) return <TokenAccessLoadingTable />

  if (flowOperators.length === 0) return null;

  return (
    <TableContainer
      data-cy={network.slugName + "-permission-and-allowances-table"}
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
      <Table sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <NetworkHeadingRow colSpan={isBelowMd ? 0 : 6} network={network} />
          {!isBelowMd && (
            <TableRow>
              <TableCell width="136px" sx={{ pl: 5 }}>
                Asset
              </TableCell>
              <TableCell width="183px">
                <Stack direction="row" gap={0.5} alignItems="center">
                  Operator
                  <TooltipWithIcon
                    title="Address that is permitted to manage your streams for a specific Super Token and network."
                    IconProps={{
                      sx: {
                        fontSize: "16px",
                        color: colors.grey[700],
                      },
                    }}
                  />
                </Stack>
              </TableCell>
              <TableCell width="186px">
                <Stack width="186px" direction="row" gap={0.5} alignItems="center">
                  Token Allowance
                  <TooltipWithIcon
                    title="Defined transfer allowance cap for Super Tokens."
                    IconProps={{
                      sx: {
                        fontSize: "16px",
                        color: colors.grey[700],
                      },
                    }}
                  />
                </Stack>
              </TableCell>
              <TableCell width="190px">
                <Stack width="190px" direction="row" gap={0.5} alignItems="center">
                  Stream Permissions
                  <TooltipWithIcon
                    title="Actions that Operator can execute on your behalf."
                    IconProps={{
                      sx: {
                        fontSize: "16px",
                        color: colors.grey[700],
                      },
                    }}
                  />
                </Stack>
              </TableCell>
              <TableCell width="232px">
                <Stack width="232px" direction="row" gap={0.5} alignItems="center">
                  Stream Allowance
                  <TooltipWithIcon
                    title="Defined flow rate allowance cap for Super Tokens."
                    IconProps={{
                      sx: {
                        fontSize: "16px",
                        color: colors.grey[700],
                      },
                    }}
                  />
                </Stack>
              </TableCell>
              <TableCell width="139px" align="center">
                Actions
              </TableCell>
            </TableRow>
          )}
        </TableHead>
        <TableBody>
          {paginatedRecords.map(
            ({
              id,
              flowOperator,
              allowance,
              permissions,
              flowRateAllowanceRemaining,
              token,
            }) => (
              <TokenAccessRow
                key={id}
                network={network}
                address={flowOperator}
                token={token}
                tokenAllowance={allowance}
                flowOperatorPermissions={permissions}
                flowRateAllowance={flowRateAllowanceRemaining}
              />
            )
          )}
        </TableBody>
      </Table>
      <TablePagination
        style={{
          borderBottomLeftRadius: 50,
          borderBottomRightRadius: 50,
        }}
        rowsPerPageOptions={[5, 10, 25, { value: flowOperators.length, label: 'All' }]}
        component="div"
        count={flowOperators.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          "> *": {
            visibility:
              flowOperators.length <= rowsPerPage ? "hidden" : "visible",
          },
        }}
      />
    </TableContainer>
  );
};