import {
  Button,
  ListItemText,
  Stack,
  TableCell,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
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
import VestedBalance from "./VestedBalance";
import VestingStatus from "./VestingStatus";
import Link from "next/link";
import { usePendingVestingScheduleClaim } from "../pendingUpdates/PendingVestingScheduleClaim";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { ClaimVestingScheduleTransactionButton } from "./transactionButtons/ClaimVestingScheduleTransactionButton";

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
    flowRate,
    endDate,
    startDate,
    pendingCreate,
    cliffAndFlowDate,
    remainderAmount
  } = vestingSchedule;

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const pendingDelete = usePendingVestingScheduleDelete(
    {
      chainId: network.id,
      superTokenAddress: superToken,
      receiverAddress: receiver,
      senderAddress: sender,
    },
    {
      skip: vestingSchedule.status.isFinished,
    }
  );

  const pendingClaim = usePendingVestingScheduleClaim(
    {
      chainId: network.id,
      superTokenAddress: superToken,
      receiverAddress: receiver,
      senderAddress: sender,
    },
    {
      skip: !vestingSchedule.status.canClaim,
    }
  );

  const { visibleAddress } = useVisibleAddress();

  const tokenQuery = useVestingToken(network, superToken);

  const totalAmount = useMemo(() => {
    return BigNumber.from(endDate - cliffAndFlowDate)
      .mul(BigNumber.from(flowRate))
      .add(BigNumber.from(cliffAmount))
      .add(BigNumber.from(remainderAmount))
      .toString();
  }, [flowRate, endDate, cliffAndFlowDate, cliffAmount, remainderAmount]);

  const isSender = visibleAddress?.toLowerCase() === sender.toLowerCase()
  const isReceiver = visibleAddress?.toLowerCase() === receiver.toLowerCase()
  const isSenderOrReceiver = isSender || isReceiver;
  const showClaim = isReceiver && !!vestingSchedule.claimValidityDate && !vestingSchedule.cliffAndFlowExecutedAt; // Note: we show only for receiver in the table.
  const showUnwrap = isReceiver && (vestingSchedule.status.isStreaming || vestingSchedule.status.isFinished);

  const VestingStatusOrPendingProgress = (
    <>
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
      ) ? pendingClaim : (
        <PendingProgress
          pendingUpdate={pendingDelete}
          transactingText="Claiming..."
        />
      ) : (
        <VestingStatus
          vestingSchedule={vestingSchedule}
          TypographyProps={{ variant: "body2" }}
        />
      )}
    </>
  )

  return (
    <TableRow
      data-cy={"vesting-row"}
      hover={!!onClick}
      onClick={onClick}
      sx={{ cursor: onClick ? "pointer" : "initial" }}
    >
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1.5}>
          <AddressAvatar
            address={isSender ? receiver : sender}
            AvatarProps={{
              sx: { width: "24px", height: "24px", borderRadius: "5px" },
            }}
            BlockiesProps={{ size: 8, scale: 3 }}
          />
          <Stack direction="column">
            <AddressCopyTooltip address={isSender ? receiver : sender}>
              <Typography data-cy={"receiver-sender"} variant="h7">
                <AddressName address={isSender ? receiver : sender} />
              </Typography>
            </AddressCopyTooltip>
            {isBelowMd && VestingStatusOrPendingProgress}
          </Stack>
        </Stack>
      </TableCell>
      {!isBelowMd ? (
        <>
          <TableCell data-cy={"allocated-amount"}>
            <Stack direction="row" alignItems="center" gap={1}>
              <TokenIcon
                isSuper
                size={26}
                tokenSymbol={tokenQuery.data?.symbol}
                isLoading={tokenQuery.isLoading}
              />
              <Typography variant="body1mono">
                <Amount wei={totalAmount} /> {tokenQuery.data?.symbol}
              </Typography>
            </Stack>
          </TableCell>
          <TableCell data-cy={"vested-amount"}>
            <Typography variant="body1mono">
              <VestedBalance vestingSchedule={vestingSchedule}>
                {" "}
                {tokenQuery.data?.symbol}
              </VestedBalance>
            </Typography>
          </TableCell>
          <TableCell sx={{ pr: 2 }}>
            <ListItemText
              data-cy={"start-end-dates"}
              primary={format(fromUnixTime(startDate), "LLL d, yyyy HH:mm")}
              secondary={format(fromUnixTime(endDate), "LLL d, yyyy HH:mm")}
              primaryTypographyProps={{ variant: "body2" }}
              secondaryTypographyProps={{ color: "text.primary" }}
            />
          </TableCell>
          <TableCell sx={{ pl: 0 }}>
            {VestingStatusOrPendingProgress}
          </TableCell>
          {
            isReceiver && (
              <TableCell
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {showClaim ? (
                  <ConnectionBoundary expectedNetwork={network}>
                    <ClaimVestingScheduleTransactionButton
                      superTokenAddress={superToken}
                      senderAddress={sender}
                      receiverAddress={receiver}
                      TransactionButtonProps={{ ButtonProps: { size: "small" } }}
                    />
                  </ConnectionBoundary>
                ) : showUnwrap ? (
                  <Link
                    href={`/wrap?downgrade&token=${superToken}&network=${network.slugName}`}
                  >
                    <Button variant="outlined" color="primary" size="small">
                      Unwrap
                    </Button>
                  </Link>
                ) : null}
              </TableCell>
            )
          }
        </>
      ) : (
        <TableCell align="right">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="end"
            gap={1.5}
          >
            <Stack direction="column" alignItems="end">
              <Typography variant="h6mono">
                <VestedBalance vestingSchedule={vestingSchedule} />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {tokenQuery.data?.symbol}
              </Typography>
            </Stack>

            <TokenIcon
              isSuper
              size={26}
              tokenSymbol={tokenQuery.data?.symbol}
              isLoading={tokenQuery.isLoading}
            />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

export default VestingRow;
