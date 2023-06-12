import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import {
  Box,
  CircularProgress,
  ListItemText,
  Skeleton,
  Stack,
  TableCell,
  TableCellProps,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Stream } from "@superfluid-finance/sdk-core";
import { format, isAfter } from "date-fns";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { FC, memo, useMemo } from "react";
import AddressName from "../../components/AddressName/AddressName";
import AddressAvatar from "../../components/Avatar/AddressAvatar";
import {
  PendingScheduledStream,
  ScheduledStream,
} from "../../hooks/streamSchedulingHooks";
import { getStreamPagePath } from "../../pages/stream/[_network]/[_stream]";
import AddressCopyTooltip from "../common/AddressCopyTooltip";
import TooltipWithIcon from "../common/TooltipWithIcon";
import { Network } from "../network/networks";
import { PendingOutgoingStream } from "../pendingUpdates/PendingOutgoingStream";
import { UnitOfTime } from "../send/FlowRateInput";
import Amount from "../token/Amount";
import FlowingBalance from "../token/FlowingBalance";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import CancelStreamButton from "./CancelStreamButton/CancelStreamButton";
import ModifyStreamButton from "./ModifyStreamButton";
import { ActiveStreamIcon, ScheduledStreamIcon } from "./StreamIcons";
import { StreamScheduling } from "./StreamScheduling";

export const StreamRowLoading = () => {
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
            <Typography variant="body2mono">
              <Skeleton width={80} />
            </Typography>
          </TableCell>
          <TableCell>
            <Typography variant="body2mono">
              <Skeleton width={80} />
            </Typography>
          </TableCell>
          <TableCell>
            <Skeleton width={80} />
          </TableCell>
          <TableCell>
            <Skeleton width={30} />
          </TableCell>
        </>
      ) : (
        <TableCell>
          <Stack alignItems="end">
            <Skeleton width={60} />
            <Skeleton width={30} />
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

type PendingStreamType = PendingOutgoingStream | PendingScheduledStream;

interface StreamRowProps {
  stream: (
    | Stream
    | PendingOutgoingStream
    | ScheduledStream
    | PendingScheduledStream
  ) &
    StreamScheduling;
  network: Network;
}

const StreamRow: FC<StreamRowProps> = ({ stream, network }) => {
  const {
    id,
    sender,
    receiver,
    currentFlowRate,
    streamedUntilUpdatedAt,
    updatedAtTimestamp,
    startDateScheduled,
    endDateScheduled,
  } = stream;

  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const router = useRouter();
  const { visibleAddress } = useVisibleAddress();

  const openStreamDetails = () => {
    router.push(
      getStreamPagePath({
        network: network.slugName,
        stream: id,
      })
    );
  };

  const isOutgoing = visibleAddress?.toLowerCase() === sender.toLowerCase();

  const pendingType = (stream as PendingStreamType).pendingType;

  const isPending = !!pendingType;

  const isPendingAndWaitingForSubgraph = !!(stream as PendingStreamType)
    .hasTransactionSucceeded;

  const isActive = !isPending && !startDateScheduled && currentFlowRate !== "0";

  const tableCellProps: Partial<TableCellProps> =
    isPending || startDateScheduled
      ? {}
      : {
          onClick: openStreamDetails,
          sx: { cursor: "pointer" },
        };

  return (
    <TableRow hover data-cy={"stream-row"}>
      <TableCell {...tableCellProps}>
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

      {!isBelowMd ? (
        <>
          <TableCell {...tableCellProps}>
            <Typography variant="h7mono">
              <FlowingBalance
                balance={streamedUntilUpdatedAt}
                flowRate={
                  isPending || !!startDateScheduled ? "0" : currentFlowRate
                }
                balanceTimestamp={updatedAtTimestamp}
                disableRoundingIndicator
              />
            </Typography>
          </TableCell>
          <TableCell {...tableCellProps}>
            {isActive || isPending || startDateScheduled ? (
              <Typography data-cy={"flow-rate"} variant="body2mono">
                {isOutgoing ? "-" : "+"}
                <Amount
                  wei={BigNumber.from(currentFlowRate).mul(UnitOfTime.Month)}
                />
                /mo
              </Typography>
            ) : (
              <Typography data-cy={"flow-rate"}>{"-"}</Typography>
            )}
          </TableCell>
          <TableCell {...tableCellProps} sx={{ px: 1, ...tableCellProps.sx }}>
            {/* // TODO(KK): Tooltips? */}
            {!!startDateScheduled || !!endDateScheduled ? (
              <ScheduledStreamIcon
                scheduledStart={!!startDateScheduled}
                scheduledEnd={!!endDateScheduled}
              />
            ) : isActive ? (
              <ActiveStreamIcon />
            ) : null}
          </TableCell>
          <TableCell {...tableCellProps} sx={{ pl: 1, ...tableCellProps.sx }}>
            <Stack data-cy={"start-end-date"}>
              <Box>
                {stream.startDate &&
                  format(stream.startDate.getTime(), "d MMM. yyyy HH:mm")}
              </Box>
              <Box>
                {stream.endDate &&
                  format(stream.endDate.getTime(), "d MMM. yyyy HH:mm")}
              </Box>
            </Stack>
          </TableCell>
        </>
      ) : (
        <TableCell align="right">
          <ListItemText
            primary={
              <FlowingBalance
                balance={streamedUntilUpdatedAt}
                flowRate={isPending ? "0" : currentFlowRate}
                balanceTimestamp={updatedAtTimestamp}
                disableRoundingIndicator
              />
            }
            secondary={
              isActive || isPending || !!startDateScheduled ? (
                <>
                  {isOutgoing ? "-" : "+"}
                  <Amount
                    wei={BigNumber.from(currentFlowRate).mul(UnitOfTime.Month)}
                  />
                  /mo
                </>
              ) : (
                "-"
              )
            }
            primaryTypographyProps={{ variant: "h7mono" }}
            secondaryTypographyProps={{ variant: "body2mono" }}
          />
        </TableCell>
      )}

      {!isBelowMd && (
        <TableCell align="right">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="end"
            gap={1}
          >
            {isPending && (
              <>
                <CircularProgress color="warning" size="16px" />
                <Typography
                  data-cy={"pending-message"}
                  variant="caption"
                  translate="yes"
                >
                  {isPendingAndWaitingForSubgraph
                    ? "Syncing..."
                    : pendingType === "CreateTaskCreate"
                    ? "Scheduling..."
                    : "Sending..."}
                </Typography>
              </>
            )}
            {!isPending && (isActive || !!startDateScheduled) && (
              <>
                {isOutgoing && (
                  <ModifyStreamButton
                    stream={stream as Stream}
                    network={network}
                    size="small"
                  />
                )}
                <CancelStreamButton
                  stream={
                    stream as (Stream | ScheduledStream) & StreamScheduling
                  }
                  network={network}
                  IconButtonProps={{ size: "small" }}
                />
              </>
            )}
          </Stack>
        </TableCell>
      )}
    </TableRow>
  );
};

export default memo(StreamRow);
