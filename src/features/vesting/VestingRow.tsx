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
import VestedBalance from "./VestedBalance";
import VestingStatus from "./VestingStatus";
import Link from "next/link";
import { usePendingVestingScheduleClaim } from "../pendingUpdates/PendingVestingScheduleClaim";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { ClaimVestingScheduleTransactionButton } from "./transactionButtons/ClaimVestingScheduleTransactionButton";
import { useTokenQuery } from "../../hooks/useTokenQuery";
import { isDefined } from "../../utils/ensureDefined";

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
    superToken: superTokenAddress,
    receiver,
    sender,
    cliffAmount,
    flowRate,
    endDate,
    startDate,
    pendingCreate,
    cliffAndFlowDate,
    remainderAmount,
    version
  } = vestingSchedule;

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const pendingDelete = usePendingVestingScheduleDelete(
    {
      chainId: network.id,
      superTokenAddress: superTokenAddress,
      receiverAddress: receiver,
      senderAddress: sender,
      version
    },
    {
      skip: vestingSchedule.status.isFinished,
    }
  );

  const pendingClaim = usePendingVestingScheduleClaim(
    {
      chainId: network.id,
      superTokenAddress: superTokenAddress,
      receiverAddress: receiver,
      senderAddress: sender,
      version
    },
    {
      skip: !vestingSchedule.status.canClaim,
    }
  );

  const { visibleAddress } = useVisibleAddress();

  const superTokenQuery = useTokenQuery({ chainId: network.id, id: superTokenAddress, onlySuperToken: true });

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

  const showVestingVersion = !isBelowMd && isSender && !!network.vestingContractAddress_v2;

  const VestingStatusOrPendingProgress = (
    <>
      {pendingDelete || pendingCreate || pendingClaim ? (
        <PendingProgress
          pendingUpdate={pendingDelete || pendingCreate || pendingClaim}
          transactingText={
            pendingDelete ? "Deleting..." :
            pendingCreate ? "Creating..." :
            "Claiming..."
          }
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
                chainId={network.id}
                tokenAddress={superTokenAddress}
                isLoading={superTokenQuery.isLoading}
              />
              <Typography variant="body1mono">
                <Amount wei={totalAmount} /> {superTokenQuery.data?.symbol}
              </Typography>
            </Stack>
          </TableCell>
          <TableCell data-cy={"vested-amount"}>
            <Typography variant="body1mono">
              <VestedBalance vestingSchedule={vestingSchedule}>
                {" "}
                {superTokenQuery.data?.symbol}
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
          {showVestingVersion && (<TableCell>{version}</TableCell>)}
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
                      superTokenAddress={superTokenAddress}
                      senderAddress={sender}
                      receiverAddress={receiver}
                      version={vestingSchedule.version}
                      TransactionButtonProps={{ ButtonProps: { size: "small" } }}
                    />
                  </ConnectionBoundary>
                ) : showUnwrap ? (
                  <Link
                    href={`/wrap?downgrade&token=${superTokenAddress}&network=${network.slugName}`}
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
                {superTokenQuery.data?.symbol}
              </Typography>
            </Stack>

            <TokenIcon
              isSuper
              size={26}
              chainId={network.id}
              tokenAddress={superTokenAddress}
              isLoading={superTokenQuery.isLoading}
            />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

export default VestingRow;
