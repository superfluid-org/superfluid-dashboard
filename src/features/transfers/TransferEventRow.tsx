import {
  Avatar,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { TransferEvent } from "@superfluid-finance/sdk-core";
import { FC } from "react";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import Blockies from "react-blockies";
import shortenAddress from "../../utils/shortenAddress";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EtherFormatted from "../token/EtherFormatted";
import { format } from "date-fns";

export const TransferEventLoadingRow = () => (
  <TableRow>
    <TableCell>
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
      <Skeleton width={100} />
    </TableCell>
  </TableRow>
);

interface TransferEventRowProps {
  transferEvent: TransferEvent;
}

const TransferEventRow: FC<TransferEventRowProps> = ({ transferEvent }) => {
  const { visibleAddress = "" } = useVisibleAddress();

  const { from, to, value, timestamp } = transferEvent;
  const isOutgoing = from === visibleAddress.toLowerCase();

  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          {isOutgoing ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          <Avatar variant="rounded">
            <Blockies seed={isOutgoing ? to : from} size={12} scale={3} />
          </Avatar>
          <Typography variant="h6">
            {shortenAddress(isOutgoing ? to : from)}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell>
        <Typography variant="body2mono">
          <EtherFormatted
            wei={value}
            etherDecimalPlaces={8}
            disableRoundingIndicator
          />
        </Typography>
      </TableCell>
      <TableCell>{format(timestamp * 1000, "d MMM. yyyy")}</TableCell>
    </TableRow>
  );
};

export default TransferEventRow;
