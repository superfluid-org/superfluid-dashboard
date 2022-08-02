import {
  Avatar,
  ListItemText,
  Skeleton,
  Stack,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { TransferEvent } from "@superfluid-finance/sdk-core";
import { FC } from "react";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Amount from "../token/Amount";
import { format } from "date-fns";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { subgraphApi } from "../redux/store";
import { Network } from "../network/networks";
import AddressCopyTooltip from "../common/AddressCopyTooltip";

export const TransferEventLoadingRow = () => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton
            variant="circular"
            width={24}
            height={24}
            sx={{ borderRadius: "10px" }}
          />
          <Typography variant="h6">
            <Skeleton width={80} />
          </Typography>
        </Stack>
      </TableCell>
      {!isBelowMd ? (
        <>
          <TableCell>
            <Skeleton width={80} />
          </TableCell>
          <TableCell>
            <Skeleton width={60} />
          </TableCell>
        </>
      ) : (
        <TableCell>
          <Stack alignItems="end">
            <Skeleton width={80} />
            <Skeleton width={60} />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

interface TransferEventRowProps {
  transferEvent: TransferEvent;
  network: Network;
}

const TransferEventRow: FC<TransferEventRowProps> = ({
  transferEvent,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { visibleAddress = "" } = useVisibleAddress();

  const { from, to, value, timestamp, token: tokenAddress } = transferEvent;
  const isOutgoing = from === visibleAddress.toLowerCase();

  const tokenQuery = subgraphApi.useTokenQuery({
    chainId: network.id,
    id: tokenAddress,
  });

  return (
    <TableRow>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          {isOutgoing ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          <AddressAvatar
            address={isOutgoing ? to : from}
            AvatarProps={{
              sx: { width: "24px", height: "24px", borderRadius: "5px" },
            }}
            BlockiesProps={{ size: 8, scale: 3 }}
          />
          <AddressCopyTooltip address={isOutgoing ? to : from}>
            <Typography variant="h7">
              <AddressName address={isOutgoing ? to : from} />
            </Typography>
          </AddressCopyTooltip>
        </Stack>
      </TableCell>
      <TableCell align="right">
        {tokenQuery.data && (
          <ListItemText
            primary={<Amount wei={value} decimals={tokenQuery.data.decimals} />}
            secondary={
              isBelowMd ? format(timestamp * 1000, "d MMM. yyyy") : undefined
            }
            primaryTypographyProps={{ variant: "h7mono" }}
          />
        )}
      </TableCell>
      {!isBelowMd && (
        <TableCell>{format(timestamp * 1000, "d MMM. yyyy")}</TableCell>
      )}
    </TableRow>
  );
};

export default TransferEventRow;
