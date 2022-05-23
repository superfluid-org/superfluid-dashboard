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
import { useWalletContext } from "../wallet/WalletContext";
import TokenStreamRow, { TokenStreamRowLoading } from "./TokenStreamRow";

interface TokenStreamsTableProps {
  network: Network;
  token: Address;
  lastElement: boolean;
}

const TokenStreamsTable: FC<TokenStreamsTableProps> = ({
  network,
  token,
  lastElement,
}) => {
  const theme = useTheme();
  const { walletAddress } = useWalletContext();

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const incomingStreamsQuery = subgraphApi.useStreamsQuery({
    chainId: network.chainId,
    filter: {
      receiver: walletAddress,
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
      sender: walletAddress,
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
      ].sort((s1, s2) => s2.updatedAtTimestamp - s1.updatedAtTimestamp),
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
      <TableContainer
        sx={{ borderRadius: 0, border: "none", boxShadow: "none" }}
      >
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
              <TableCell width="290">All Time Flow</TableCell>
              <TableCell width="300">Flow rate</TableCell>
              <TableCell width="300">Start / End Date</TableCell>
              <TableCell width="120" align="center">
                Filter
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TokenStreamRowLoading />
            ) : (
              data
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((stream) => (
                  <TokenStreamRow
                    key={stream.id}
                    stream={stream}
                    network={network}
                  />
                ))
            )}
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
        sx={{
          "> *": {
            visibility: data.length <= 5 ? "hidden" : "visible",
          },
        }}
      />
    </Box>
  );
};

export default memo(TokenStreamsTable);
