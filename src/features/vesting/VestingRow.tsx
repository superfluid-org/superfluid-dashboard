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

  const { visibleAddress } = useVisibleAddress();

  const tokenQuery = useVestingToken(network, superToken);

  const totalAmount = useMemo(() => {
    return BigNumber.from(endDate - cliffAndFlowDate)
      .mul(BigNumber.from(flowRate))
      .add(BigNumber.from(cliffAmount))
      .toString();
  }, [flowRate, endDate, cliffAndFlowDate, cliffAmount]);

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
          <AddressAvatar
            address={isOutgoing ? receiver : sender}
            AvatarProps={{
              sx: { width: "24px", height: "24px", borderRadius: "5px" },
            }}
            BlockiesProps={{ size: 8, scale: 3 }}
          />
          <Stack direction="column">
            <AddressCopyTooltip address={isOutgoing ? receiver : sender}>
              <Typography data-cy={"receiver-sender"} variant="h7">
                <AddressName address={isOutgoing ? receiver : sender} />
              </Typography>
            </AddressCopyTooltip>
            {isBelowMd && (
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
                ) : (
                  <VestingStatus
                    vestingSchedule={vestingSchedule}
                    TypographyProps={{ variant: "body2" }}
                  />
                )}
              </>
            )}
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
            ) : (
              <VestingStatus vestingSchedule={vestingSchedule} />
            )}
          </TableCell>
          {!isOutgoing && (
            <TableCell
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Link
                href={`/wrap?downgrade&token=${superToken}&network=${network.slugName}`}
              >
                <Button variant="contained" color="primary" size="small">
                  Unwrap
                </Button>
              </Link>
            </TableCell>
          )}
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
