import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { format, fromUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { FC, useMemo } from "react";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import { VestingSchedule } from "../../vesting-subgraph/schema.generated";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import { Network } from "../network/networks";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { useVestingToken } from "./useVestingToken";

interface VestingRowProps {
  network: Network;
  vestingSchedule: VestingSchedule;
}

const VestingRow: FC<VestingRowProps> = ({ network, vestingSchedule }) => {
  const {
    id,
    superToken,
    receiver,
    sender,
    cliffAmount,
    cliffDate,
    flowRate,
    endDate,
    startDate,
  } = vestingSchedule;

  const router = useRouter();
  const { visibleAddress } = useVisibleAddress();

  const tokenQuery = useVestingToken(network, superToken);

  const openDetails = () => router.push(`/vesting/goerli/${id}`);

  const totalAmount = useMemo(() => {
    return BigNumber.from(endDate)
      .sub(BigNumber.from(cliffDate))
      .mul(BigNumber.from(flowRate))
      .add(BigNumber.from(cliffAmount))
      .toString();
  }, [flowRate, endDate, cliffDate, cliffAmount]);

  const isOutgoing = sender.toLowerCase() === visibleAddress?.toLowerCase();

  return (
    <TableRow hover onClick={openDetails}>
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          {isOutgoing ? <ArrowForwardIcon /> : <ArrowBackIcon />}
          <AddressAvatar
            address={isOutgoing ? receiver : sender}
            AvatarProps={{
              sx: { width: "24px", height: "24px", borderRadius: "5px" },
            }}
            BlockiesProps={{ size: 8, scale: 3 }}
          />
          <AddressCopyTooltip address={isOutgoing ? receiver : sender}>
            <Typography data-cy={"sender-receiver-address"} variant="h7">
              <AddressName address={isOutgoing ? receiver : sender} />
            </Typography>
          </AddressCopyTooltip>
        </Stack>
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <TokenIcon
            isSuper
            tokenSymbol={tokenQuery.data?.symbol}
            isLoading={tokenQuery.isLoading}
          />
          <ListItemText
            primary={
              <>
                <Amount wei={totalAmount} /> {tokenQuery.data?.symbol}
              </>
            }
          />
        </Stack>
      </TableCell>
      <TableCell>
        <ListItemText
          primary={
            <>
              <Amount wei={cliffAmount} /> {tokenQuery.data?.symbol}
            </>
          }
          secondary={format(fromUnixTime(Number(cliffDate)), "LLL d, yyyy")}
        />
      </TableCell>
      <TableCell>
        <ListItemText
          primary={format(fromUnixTime(Number(startDate)), "LLL d, yyyy")}
          secondary={format(fromUnixTime(Number(endDate)), "LLL d, yyyy")}
          primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
        />
      </TableCell>
    </TableRow>
  );
};

export default VestingRow;
