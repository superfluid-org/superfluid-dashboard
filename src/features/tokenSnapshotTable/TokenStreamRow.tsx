import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Avatar, Stack, TableCell, TableRow, Typography } from "@mui/material";
import { Address, Stream } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { FC, memo } from "react";
import shortenAddress from "../../utils/shortenAddress";
import EtherFormatted from "../token/EtherFormatted";
import FlowingBalance from "../token/FlowingBalance";

interface TokenStreamRowProps {
  address: Address;
  stream: Stream;
}

const TokenStreamRow: FC<TokenStreamRowProps> = ({ address, stream }) => {
  const {
    sender,
    receiver,
    currentFlowRate,
    streamedUntilUpdatedAt,
    updatedAtTimestamp,
  } = stream;

  const outgoing = sender === address;
  const ongoing = Number(currentFlowRate) > 0;

  return (
    <TableRow hover>
      <TableCell sx={{ pl: "72px" }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          {outgoing ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          <Avatar variant="rounded" />
          <Typography variant="h6">
            {shortenAddress(outgoing ? receiver : sender)}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1}>
          {format(updatedAtTimestamp * 1000, "d MMM. yyyy")}
          {ongoing && <AllInclusiveIcon />}
        </Stack>
      </TableCell>
      <TableCell>
        {ongoing ? (
          <>
            {outgoing ? "- " : "+ "}
            <EtherFormatted wei={currentFlowRate} />
            /mo
          </>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        <FlowingBalance
          balance={streamedUntilUpdatedAt}
          flowRate={currentFlowRate}
          balanceTimestamp={updatedAtTimestamp}
        />
      </TableCell>
      <TableCell>Cancel</TableCell>
    </TableRow>
  );
};

export default memo(TokenStreamRow);
