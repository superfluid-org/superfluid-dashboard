import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { FC, memo, useMemo } from "react";
import { Network } from "../network/networks";
import { subgraphApi } from "../redux/store";
import TokenStreamRow from "./TokenStreamRow";

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

  return (
    <Table
      size="small"
      sx={{
        ...(lastElement
          ? { borderTop: `1px solid ${theme.palette.divider}` }
          : {
              borderBottom: `1px solid ${theme.palette.divider}`,
            }),
        background: theme.palette.action.hover,
        borderRadius: lastElement ? "0 0 20px 20px" : 0,
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell sx={{ pl: "72px" }}>To / From</TableCell>
          <TableCell width="200px">Start / End Date</TableCell>
          <TableCell width="260px">Monthly Flow</TableCell>
          <TableCell width="260px">All Time Flow</TableCell>
          <TableCell>Filter</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((stream) => (
          <TokenStreamRow key={stream.id} address={address} stream={stream} />
        ))}
      </TableBody>
    </Table>
  );
};

export default memo(TokenStreamsTable);
