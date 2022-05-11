import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, memo, useMemo, useState } from "react";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import TokenStreamRow, { TokenStreamRowLoading } from "./TokenStreamRow";

interface TokenStreamsTableProps {
  address: Address;
  network: Network;
  token: Address;
  lastElement: boolean;
}

const TokenStreamsTable: FC<TokenStreamsTableProps> = ({
  address,
  network,
  token,
  lastElement,
}) => {
  const theme = useTheme();

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const incomingStreamsQuery = subgraphApi.useStreamsQuery({
    chainId: network.chainId,
    filter: {
      receiver: address,
      token: token,
    },
    pagination: {
      take: Infinity,
      skip: 0,
    },
    order: {
      orderBy: "updatedAtTimestamp",
      orderDirection: "desc",
    },
  });

  const outgoingStreamsQuery = subgraphApi.useStreamsQuery({
    chainId: network.chainId,
    filter: {
      sender: address,
      token: token,
    },
    pagination: {
      take: Infinity,
      skip: 0,
    },
    order: {
      orderBy: "updatedAtTimestamp",
      orderDirection: "desc",
    },
  });

  const data = useMemo(
    () =>
      [
        ...(incomingStreamsQuery.data?.data || []),
        ...(outgoingStreamsQuery.data?.data || []),
      ].sort((s1, s2) => s1.updatedAtTimestamp - s2.updatedAtTimestamp),
    [incomingStreamsQuery, outgoingStreamsQuery]
  );

  const handleChangePage = (_e: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isLoading =
    data.length === 0 &&
    (incomingStreamsQuery.isLoading || incomingStreamsQuery.isLoading);

  return (
    <Box
      sx={{
        background: theme.palette.action.hover,
        borderRadius: lastElement ? "0 0 20px 20px" : 0,
      }}
    >
      <TableContainer>
        <Table
          size="small"
          sx={{
            ...(lastElement && {
              borderTop: `1px solid ${theme.palette.divider}`,
            }),
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: "72px" }} width="185">
                To / From
              </TableCell>
              <TableCell>All Time Flow</TableCell>
              <TableCell width="280">Monthly Flow</TableCell>
              <TableCell width="200">Start / End Date</TableCell>
              <TableCell width="110">Filter</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && <TokenStreamRowLoading />}
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((stream) => (
                <TokenStreamRow
                  key={stream.id}
                  address={address}
                  stream={stream}
                />
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default memo(TokenStreamsTable);
