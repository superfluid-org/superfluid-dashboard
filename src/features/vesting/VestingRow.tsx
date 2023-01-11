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
import { FC, useMemo } from "react";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import { Network } from "../network/networks";
import { PendingProgress } from "../pendingUpdates/PendingProgress";
import { PendingVestingSchedule } from "../pendingUpdates/PendingVestingSchedule";
import { usePendingVestingScheduleDelete } from "../pendingUpdates/PendingVestingScheduleDelete";
import Amount from "../token/Amount";
import TokenIcon from "../token/TokenIcon";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import { VestingSchedule } from "./types";
import { useVestingToken } from "./useVestingToken";

interface VestingRowProps {
  network: Network;
  vestingSchedule: VestingSchedule & { pendingCreate?: PendingVestingSchedule };
  onClick?: () => void;
}

const VestingRow: FC<VestingRowProps> = ({
  network,
  vestingSchedule,
  onClick,
}) => {
  const {
    superToken,
    receiver,
    sender,
    cliffAmount,
    cliffDate,
    flowRate,
    endDate,
    startDate,
    pendingCreate,
  } = vestingSchedule;

  const pendingDelete = usePendingVestingScheduleDelete({
    chainId: network.id,
    superTokenAddress: superToken,
    receiverAddress: receiver,
    senderAddress: sender,
  });

  const { visibleAddress } = useVisibleAddress();

  const tokenQuery = useVestingToken(network, superToken);

  const totalAmount = useMemo(() => {
    return BigNumber.from(endDate)
      .sub(BigNumber.from(cliffDate))
      .mul(BigNumber.from(flowRate))
      .add(BigNumber.from(cliffAmount))
      .toString();
  }, [flowRate, endDate, cliffDate, cliffAmount]);

  const isOutgoing = sender.toLowerCase() === visibleAddress?.toLowerCase();

  return (
    <TableRow
      data-cy={"vesting-row"}
      hover={!!onClick}
      onClick={onClick}
      sx={{ cursor: onClick ? "pointer" : "initial" }}
    >
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
            <Typography data-cy={"receiver-sender"} variant="h7">
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
            data-cy={"total-vesting-amount"}
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
          data-cy={"cliff-amount-and-date"}
          primary={
            <>
              <Amount wei={cliffAmount} /> {tokenQuery.data?.symbol}
            </>
          }
          secondary={format(fromUnixTime(Number(cliffDate)), "LLL d, yyyy")}
        />
      </TableCell>
      <TableCell sx={{ pr: 2 }}>
        <ListItemText
          data-cy={"start-end-dates"}
          primary={format(fromUnixTime(Number(startDate)), "LLL d, yyyy")}
          secondary={format(fromUnixTime(Number(endDate)), "LLL d, yyyy")}
          primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
        />
      </TableCell>
      <TableCell sx={{ pl: 0, pr: 2 }}>
        {pendingDelete ? (
          <PendingProgress
            pendingUpdate={pendingDelete}
            transactingText="Deleting..."
          />
        ) : pendingCreate ? (
          <PendingProgress
            pendingUpdate={pendingDelete}
            transactingText="Creating..."
          />
        ) : null}
      </TableCell>
    </TableRow>
  );
};

export default VestingRow;
