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
} from "@mui/material";
import TokenAccessRow from "./TokenAccessRow";
import { FetchingStatus } from "./TokenAccessTables";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import NetworkHeadingRow from "../../components/Table/NetworkHeadingRow";
import TokenAccessLoadingTable from "./TokenAccessLoadingTable";

interface Props {
  address: Address;
  network: Network;
  fetchingCallback: (networkId: number, fetchingStatus: FetchingStatus) => void;
}

const TokenAccessTable: FC<Props> = ({
  address,
  network,
  fetchingCallback,
}) => {
  const theme = useTheme();

  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const { flowOperators, ...flowOperatorsQuery } =
    subgraphApi.useFlowOperatorsQuery(
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
          take: Infinity,
          skip: 0,
        },
      },
      {
        refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
        selectFromResult: (result) => ({
          ...result,
          flowOperators: result.data?.items ?? [],
        }),
      }
    );

  useEffect(() => {
    fetchingCallback(network.id, {
      isLoading: flowOperatorsQuery.isLoading,
      hasContent: flowOperators.length > 0,
    });
  }, [
    network.id,
    flowOperatorsQuery.isLoading,
    flowOperators,
    fetchingCallback,
  ]);

  const handleChangePage = () => (_e: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage =
    () => (event: ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(rowsPerPage);
      setPage(page);
    };

  const paginatedRecords = useMemo(
    () => flowOperators.slice(page * rowsPerPage, (page + 1) * rowsPerPage),
    [page, rowsPerPage, flowOperators]
  );

  if(flowOperatorsQuery.isLoading) return  <TokenAccessLoadingTable />
  
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
              <TableCell width="183px">Operator</TableCell>
              <TableCell width="186px">Token Allowance</TableCell>
              <TableCell width="183px">Stream Permissions</TableCell>
              <TableCell width="232px">Stream Allowance</TableCell>
              <TableCell width="139px" align="center">Actions</TableCell>
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
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={flowOperators.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage()}
        onRowsPerPageChange={handleChangeRowsPerPage()}
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

export default TokenAccessTable;
