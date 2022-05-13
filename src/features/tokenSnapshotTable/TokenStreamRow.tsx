import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Avatar,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { Address, Stream } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { FC, memo } from "react";
import shortenAddress from "../../utils/shortenAddress";
import { UnitOfTime } from "../send/FlowRateInput";
import EtherFormatted from "../token/EtherFormatted";
import FlowingBalance from "../token/FlowingBalance";
import Blockies from "react-blockies";

export const TokenStreamRowLoading = () => (
  <TableRow>
    <TableCell sx={{ pl: "72px" }}>
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton
          variant="circular"
          width={36}
          height={36}
          sx={{ borderRadius: "10px" }}
        />
        <Typography variant="h6">
          <Skeleton width={100} />
        </Typography>
      </Stack>
    </TableCell>
    <TableCell>
      <Typography variant="body2mono">
        <Skeleton width={150} />
      </Typography>
    </TableCell>
    <TableCell>
      <Typography variant="body2mono">
        <Skeleton width={150} />
      </Typography>
    </TableCell>
    <TableCell>
      <Skeleton width={100} />
    </TableCell>
    <TableCell>Cancel</TableCell>
  </TableRow>
);

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
          <Avatar variant="rounded" sx={{ width: 32, height: 32 }}>
            <Blockies seed={outgoing ? receiver : sender} />
          </Avatar>
          <Typography variant="h6">
            {shortenAddress(outgoing ? receiver : sender)}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2mono">
          <FlowingBalance
            balance={streamedUntilUpdatedAt}
            flowRate={currentFlowRate}
            balanceTimestamp={updatedAtTimestamp}
            etherDecimalPlaces={8}
            disableRoundingIndicator
          />
        </Typography>
      </TableCell>
      <TableCell>
        {ongoing ? (
          <Typography variant="body2mono">
            {outgoing ? "-" : "+"}
            <EtherFormatted
              wei={BigNumber.from(currentFlowRate).mul(UnitOfTime.Month)}
              etherDecimalPlaces={8}
              disableRoundingIndicator
            />
            /mo
          </Typography>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1}>
          {format(updatedAtTimestamp * 1000, "d MMM. yyyy")}
          {ongoing && <AllInclusiveIcon />}
        </Stack>
      </TableCell>
      <TableCell>Cancel</TableCell>
    </TableRow>
  );
};

export default memo(TokenStreamRow);
