import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  CircularProgress,
  ListItemText,
  Skeleton,
  Stack,
  TableCell,
  TableCellProps,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Stream } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { FC, memo } from "react";
import AddressAvatar from "../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../components/AddressName/AddressName";
import { getStreamPagePath } from "../../pages/stream/[_network]/[_stream]";
import { Network } from "../network/networks";
import { PendingOutgoingStream } from "../pendingUpdates/PendingOutgoingStream";
import { UnitOfTime } from "../send/FlowRateInput";
import Ether from "../token/Ether";
import FlowingBalance from "../token/FlowingBalance";
import { useVisibleAddress } from "../wallet/VisibleAddressContext";
import CancelStreamButton from "./CancelStreamButton/CancelStreamButton";

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

interface StreamRowProps {
  stream: Stream | PendingOutgoingStream;
  network: Network;
}

const StreamRow: FC<StreamRowProps> = ({ stream, network }) => {
  const {
    id,
    sender,
    receiver,
    currentFlowRate,
    streamedUntilUpdatedAt,
    createdAtTimestamp,
    updatedAtTimestamp,
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

  const isPending = !!(stream as PendingOutgoingStream).pendingType;
  const isPendingAndWaitingForSubgraph = !!(stream as PendingOutgoingStream)
    .hasTransactionSucceeded;
  const isActive = !isPending && currentFlowRate !== "0";

  const tableCellProps: Partial<TableCellProps> = isPending
    ? {}
    : { onClick: openStreamDetails, sx: { cursor: "pointer" } };

  return (
    <TableRow hover>
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
          <Typography data-cy={"sender-receiver-address"} variant="h7">
            <AddressName address={isOutgoing ? receiver : sender} />
          </Typography>
        </Stack>
      </TableCell>

      {!isBelowMd ? (
        <>
          <TableCell {...tableCellProps}>
            <Typography variant="h7mono">
              <FlowingBalance
                balance={streamedUntilUpdatedAt}
                flowRate={isPending ? "0" : currentFlowRate}
                balanceTimestamp={updatedAtTimestamp}
                disableRoundingIndicator
              />
            </Typography>
          </TableCell>
          <TableCell {...tableCellProps}>
            {isActive || isPending ? (
              <Typography data-cy={"flow-rate"} variant="body2mono">
                {isOutgoing ? "-" : "+"}
                <Ether
                  wei={BigNumber.from(currentFlowRate).mul(UnitOfTime.Month)}
                />
                /mo
              </Typography>
            ) : (
              <Typography data-cy={"flow-rate"}>{"-"}</Typography>
            )}
          </TableCell>
          <TableCell {...tableCellProps}>
            <Stack
              data-cy={"start-end-date"}
              direction="row"
              alignItems="center"
              gap={1}
            >
              {format(
                (isActive ? createdAtTimestamp : updatedAtTimestamp) * 1000,
                "d MMM. yyyy"
              )}
              {isActive && <AllInclusiveIcon />}
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
              isActive || isPending ? (
                <>
                  {isOutgoing ? "-" : "+"}
                  <Ether
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
        <TableCell align="center">
          {isPending && (
            <Stack direction="row" alignItems="center" gap={1}>
              <CircularProgress color="warning" size="16px" />
              <Typography variant="caption">
                {isPendingAndWaitingForSubgraph ? "Syncing..." : "Sending..."}
              </Typography>
            </Stack>
          )}
          {isActive && !isPending && (
            <CancelStreamButton stream={stream as Stream} network={network} />
          )}
        </TableCell>
      )}
    </TableRow>
  );
};

export default memo(StreamRow);
