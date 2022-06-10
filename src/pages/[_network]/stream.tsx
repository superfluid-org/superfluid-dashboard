import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";
import ShareIcon from "@mui/icons-material/Share";
import {
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import Error from "next/error";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC, useMemo } from "react";
import Blockies from "react-blockies";
import NetworkIcon from "../../features/network/NetworkIcon";
import { subgraphApi } from "../../features/redux/store";
import {
  getNetworkStaticPaths,
  getNetworkStaticProps,
} from "../../features/routing/networkPaths";
import { UnitOfTime } from "../../features/send/FlowRateInput";
import EtherFormatted from "../../features/token/EtherFormatted";
import FlowingBalance from "../../features/token/FlowingBalance";
import TokenIcon from "../../features/token/TokenIcon";
import withPathNetwork, { NetworkPage } from "../../hoc/withPathNetwork";
import shortenAddress from "../../utils/shortenAddress";
import {
  calculateBuffer,
  calculateMaybeCriticalAtTimestamp,
} from "../../utils/tokenUtils";

interface OverviewItemProps {
  label: string;
  value: any;
}

const OverviewItem: FC<OverviewItemProps> = ({ label, value }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Typography variant="body1" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6">{value}</Typography>
  </Stack>
);

const Stream: FC<NetworkPage> = ({ network }) => {
  const theme = useTheme();
  const router = useRouter();

  const streamId = (router.query.stream || "") as string;
  const [senderAddress = "", receiverAddress = "", tokenAddress = ""] =
    streamId.split("-");

  const streamQuery = subgraphApi.useStreamQuery({
    chainId: network.id,
    id: streamId,
  });

  const tokenSnapshotQuery = subgraphApi.useAccountTokenSnapshotQuery({
    chainId: network.id,
    id: `${senderAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`,
  });

  const liquidationDate = useMemo(() => {
    if (!tokenSnapshotQuery.data) return null;
    const {
      balanceUntilUpdatedAt,
      totalNetFlowRate,
      updatedAtTimestamp: snapshotUpdatedAtTimestamp,
    } = tokenSnapshotQuery.data;

    return new Date(
      calculateMaybeCriticalAtTimestamp(
        BigNumber.from(snapshotUpdatedAtTimestamp),
        BigNumber.from(balanceUntilUpdatedAt),
        BigNumber.from(0),
        BigNumber.from(totalNetFlowRate)
      ).toNumber() * 1000
    );
  }, [tokenSnapshotQuery.data]);

  const bufferSize = useMemo(() => {
    if (!streamQuery.data || streamQuery.data.currentFlowRate === "0")
      return null;

    const { currentFlowRate, createdAtTimestamp, streamedUntilUpdatedAt } =
      streamQuery.data;

    return calculateBuffer(
      BigNumber.from(streamedUntilUpdatedAt),
      BigNumber.from(currentFlowRate),
      createdAtTimestamp,
      network.bufferTimeInMinutes
    );
  }, [streamQuery.data, network]);

  if (
    streamQuery.isLoading ||
    streamQuery.isFetching ||
    tokenSnapshotQuery.isLoading ||
    tokenSnapshotQuery.isFetching
  ) {
    return <Container />;
  }

  if (!streamQuery.data || !tokenSnapshotQuery.data) {
    return <Error statusCode={404} />;
  }

  const handleBack = () => router.back();

  const {
    streamedUntilUpdatedAt,
    currentFlowRate,
    tokenSymbol,
    receiver,
    sender,
    createdAtTimestamp,
    updatedAtTimestamp,
  } = streamQuery.data;

  const isActive = currentFlowRate !== "0";

  // TODO: This container max width should be configured in theme. Something between small and medium
  return (
    <Container>
      <Stack
        alignItems="center"
        gap={3}
        sx={{ maxWidth: "760px", margin: "0 auto" }}
      >
        <Stack
          alignItems="center"
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            mb: 7,
            mt: 3,
            width: "100%",
          }}
        >
          <Box>
            <IconButton color="inherit" onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
          </Box>
          <Stack direction="row" alignItems="center" gap={1}>
            {!isActive && updatedAtTimestamp && (
              <>
                <CloseIcon color="error" />
                <Typography variant="h5" color="error">
                  {`Cancelled on ${format(
                    updatedAtTimestamp * 1000,
                    "d MMMM yyyy"
                  )} at ${format(updatedAtTimestamp * 1000, "h:mm aaa")}`}
                </Typography>
              </>
            )}
          </Stack>
          <Stack direction="row" justifyContent="flex-end" gap={1}>
            {/* {isActive && (
              <>
                <IconButton color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton color="error">
                  <CancelIcon />
                </IconButton>
              </>
            )} */}
          </Stack>
        </Stack>

        <Stack alignItems="center" gap={1} sx={{ mb: 4 }}>
          <Typography variant="h5">Total Amount Streamed</Typography>

          <Stack direction="row" alignItems="center" gap={2}>
            <TokenIcon tokenSymbol={tokenSymbol} size={60} />
            <Stack direction="row" alignItems="end" gap={2}>
              <Typography variant="h1mono" sx={{ lineHeight: "48px" }}>
                <FlowingBalance
                  balance={streamedUntilUpdatedAt}
                  flowRate={currentFlowRate}
                  balanceTimestamp={updatedAtTimestamp}
                  etherDecimalPlaces={currentFlowRate === "0" ? 8 : undefined}
                  disableRoundingIndicator
                />
              </Typography>
              <Typography
                variant="h3"
                color="primary"
                sx={{ lineHeight: "28px" }}
              >
                {tokenSymbol}
              </Typography>
            </Stack>
          </Stack>

          <Typography variant="h4" color="text.secondary">
            {/* $2241.30486 USD */}
          </Typography>
        </Stack>

        <Stack
          alignItems="center"
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 88px 1fr",
            rowGap: 2,
            width: "100%",
          }}
        >
          <Typography variant="h6" sx={{ pl: 1 }}>
            Sender
          </Typography>
          <Box />
          <Typography variant="h6" sx={{ pl: 1 }}>
            Receiver
          </Typography>
          <Stack flex={1} gap={2}>
            <Paper
              component={Stack}
              direction="row"
              alignItems="center"
              gap={2}
              sx={{ py: 2, px: 3 }}
            >
              <Avatar variant="rounded">
                <Blockies seed={sender} size={12} scale={3} />
              </Avatar>

              <ListItemText primary={shortenAddress(sender, 8)} />
            </Paper>
          </Stack>

          <Box sx={{ mx: -0.25, height: 48, zIndex: -1 }}>
            <Image
              unoptimized
              src="/gifs/stream-loop.gif"
              width={92}
              height={48}
              layout="fixed"
              alt="Superfluid stream"
            />
          </Box>

          <Stack flex={1} gap={2}>
            <Paper
              component={Stack}
              direction="row"
              alignItems="center"
              gap={2}
              sx={{ py: 2, px: 3 }}
            >
              <Avatar variant="rounded">
                <Blockies seed={receiver} size={12} scale={3} />
              </Avatar>

              <ListItemText primary={shortenAddress(receiver, 8)} />
            </Paper>
          </Stack>
        </Stack>

        {currentFlowRate !== "0" && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography variant="h6">
              <EtherFormatted
                wei={BigNumber.from(currentFlowRate).mul(UnitOfTime.Month)}
                etherDecimalPlaces={8}
                disableRoundingIndicator
              />
            </Typography>

            <Typography variant="h6" color="text.secondary">
              per month
            </Typography>
          </Stack>
        )}

        <Stack
          rowGap={0.5}
          columnGap={6}
          sx={{
            maxWidth: "740px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            mt: 7,
          }}
        >
          <OverviewItem
            label="Start Date:"
            value={format(createdAtTimestamp * 1000, "d MMM. yyyy H:mm")}
          />
          <OverviewItem
            label="Buffer:"
            value={
              bufferSize ? (
                <>
                  <EtherFormatted
                    wei={bufferSize}
                    etherDecimalPlaces={10}
                    disableRoundingIndicator
                  />{" "}
                  {tokenSymbol}
                </>
              ) : (
                "-"
              )
            }
          />
          <OverviewItem
            label={`${isActive ? "Updated" : "End"} Date:`}
            value={
              updatedAtTimestamp
                ? format(updatedAtTimestamp * 1000, "d MMM. yyyy H:mm")
                : "-"
            }
          />
          <OverviewItem
            label="Network Name:"
            value={
              <Stack direction="row" alignItems="center" gap={0.5}>
                <NetworkIcon network={network} size={16} fontSize={12} />
                <Typography variant="h6">{network.name}</Typography>
              </Stack>
            }
          />
          <OverviewItem
            label="Projected Liquidation:"
            value={
              isActive && liquidationDate
                ? format(liquidationDate, "d MMM. yyyy H:mm")
                : "-"
            }
          />
          <OverviewItem
            label="Transaction ID:"
            value={shortenAddress(streamId, 6)}
          />
        </Stack>

        <Divider sx={{ maxWidth: "375px", width: "100%", my: 1 }} />

        <Stack direction="row" alignItems="center" gap={1}>
          <ShareIcon sx={{ width: 18, height: 18 }} />
          <Typography variant="h5" sx={{ mr: 1 }}>
            Share:
          </Typography>

          <Avatar
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: "#fff",
              width: 30,
              height: 30,
            }}
          >
            <LinkIcon
              sx={{ transform: "rotate(135deg)", width: 20, height: 20 }}
            />
          </Avatar>

          <Image
            unoptimized
            src="/icons/social/twitter.svg"
            width={30}
            height={30}
            layout="fixed"
            alt="Twitter logo"
          />
          <Image
            unoptimized
            src="/icons/social/discord.svg"
            width={30}
            height={30}
            layout="fixed"
            alt="Discord logo"
          />
          <Image
            unoptimized
            src="/icons/social/telegram.svg"
            width={30}
            height={30}
            layout="fixed"
            alt="Telegram logo"
          />
        </Stack>
      </Stack>
    </Container>
  );
};

export default withPathNetwork(Stream);

export const getStaticPaths = getNetworkStaticPaths;
export const getStaticProps = getNetworkStaticProps;
