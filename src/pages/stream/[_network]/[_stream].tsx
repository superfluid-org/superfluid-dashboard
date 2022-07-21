import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import LinkIcon from "@mui/icons-material/Link";
import ShareIcon from "@mui/icons-material/Share";
import {
  Box,
  Container,
  Divider,
  IconButton,
  Link as MuiLink,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Address } from "@superfluid-finance/sdk-core";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { isString } from "lodash";
import { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import AddressAvatar from "../../../components/AddressAvatar/AddressAvatar";
import AddressName from "../../../components/AddressName/AddressName";
import CopyTooltip from "../../../components/CopyTooltip/CopyTooltip";
import NetworkIcon from "../../../features/network/NetworkIcon";
import { Network, networksBySlug } from "../../../features/network/networks";
import { subgraphApi } from "../../../features/redux/store";
import { UnitOfTime } from "../../../features/send/FlowRateInput";
import CancelStreamButton from "../../../features/streamsTable/CancelStreamButton/CancelStreamButton";
import Ether from "../../../features/token/Ether";
import FlowingBalance from "../../../features/token/FlowingBalance";
import TokenIcon from "../../../features/token/TokenIcon";
import {
  calculateBuffer,
  calculateMaybeCriticalAtTimestamp,
} from "../../../utils/tokenUtils";
import Page404 from "../../404";

const TEXT_TO_SHARE = encodeURIComponent("Hello World");
interface StreamAccountCardProps {
  address: Address;
}

const StreamAccountCard: FC<StreamAccountCardProps> = ({ address }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Stack flex={1} gap={2}>
      <Paper
        component={Stack}
        direction="row"
        alignItems="center"
        gap={isBelowMd ? 1 : 2}
        sx={{
          py: 2,
          px: 3,
          [theme.breakpoints.down("md")]: {
            py: 1.5,
            px: 2,
          },
        }}
      >
        <AddressAvatar
          address={address}
          {...(isBelowMd
            ? {
                AvatarProps: {
                  sx: {
                    width: "24px",
                    height: "24px",
                    borderRadius: "5px",
                  },
                },
                BlockiesProps: { size: 8, scale: 3 },
              }
            : {})}
        />
        <ListItemText
          primary={
            <AddressName
              address={address}
              length={isBelowMd ? "short" : "medium"}
            />
          }
          primaryTypographyProps={{ variant: isBelowMd ? "h7" : "h6" }}
        />
      </Paper>
    </Stack>
  );
};

interface CancelledIndicatorProps {
  updatedAtTimestamp: number;
}

const CancelledIndicator: FC<CancelledIndicatorProps> = ({
  updatedAtTimestamp,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Stack direction="row" alignItems="center" gap={1}>
      {!isBelowMd && <CloseIcon color="error" />}
      <Typography variant={isBelowMd ? "h6" : "h5"} color="error">
        {`Cancelled on ${format(
          updatedAtTimestamp * 1000,
          "d MMMM yyyy"
        )} at ${format(updatedAtTimestamp * 1000, "h:mm aaa")}`}
      </Typography>
    </Stack>
  );
};

interface ShareButtonProps {
  imgSrc: string;
  alt: string;
  tooltip: string;
  href?: string;
}

const ShareButton: FC<ShareButtonProps> = ({ imgSrc, alt, tooltip, href }) => (
  <Tooltip title={tooltip} placement="top">
    <MuiLink href={href} target="_blank">
      <Box sx={{ display: "flex" }}>
        <Image
          unoptimized
          src={imgSrc}
          width={30}
          height={30}
          layout="fixed"
          alt={alt}
        />
      </Box>
    </MuiLink>
  </Tooltip>
);

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

export const getStreamPagePath = ({
  network,
  stream,
}: {
  network: string;
  stream: string;
}) => `/stream/${network}/${stream}`;

const StreamPage: NextPage = () => {
  const router = useRouter();

  const [network, setNetwork] = useState<Network | undefined>();
  const [streamId, setStreamId] = useState<string | undefined>();

  useEffect(() => {
    if (router.isReady) {
      setNetwork(
        networksBySlug.get(
          isString(router.query._network) ? router.query._network : ""
        )
      );
      setStreamId(
        isString(router.query._stream) ? router.query._stream : undefined
      );
    }
  }, [router.isReady, router.query._stream]);

  const isPageReady = router.isReady;
  if (!isPageReady) return <Container />;

  if (network && streamId) {
    return <StreamPageContent network={network} streamId={streamId} />;
  } else {
    return <Page404 />;
  }
};

const StreamPageContent: FC<{
  network: Network;
  streamId: string;
}> = ({ network, streamId }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const { address: accountAddress } = useAccount();

  const [senderAddress = "", receiverAddress, tokenAddress = ""] =
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
      calculateMaybeCriticalAtTimestamp({
        updatedAtTimestamp: snapshotUpdatedAtTimestamp,
        balanceUntilUpdatedAtWei: balanceUntilUpdatedAt,
        totalNetFlowRateWei: totalNetFlowRate,
      }).toNumber() * 1000
    );
  }, [tokenSnapshotQuery.data]);

  const urlToShare = useMemo(() => {
    return `${window.location.origin}${window.location.pathname}?stream=${streamId}`;
  }, [streamId]);

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
    return <Page404 />;
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
  const encodedUrlToShare = encodeURIComponent(urlToShare);
  const isOutgoing = accountAddress?.toLowerCase() === sender.toLowerCase();

  // TODO: This container max width should be configured in theme. Something between small and medium
  return (
    <Container maxWidth="lg">
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
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
            [theme.breakpoints.down("md")]: {
              my: 0,
            },
          }}
        >
          <Box>
            <IconButton color="inherit" onClick={handleBack}>
              <ArrowBackIcon />
            </IconButton>
          </Box>

          <Box flex={1}>
            {!isBelowMd && !isActive && updatedAtTimestamp && (
              <CancelledIndicator updatedAtTimestamp={updatedAtTimestamp} />
            )}
          </Box>

          <Stack direction="row" justifyContent="flex-end" gap={1}>
            {isActive && isOutgoing && (
              <CancelStreamButton
                stream={streamQuery.data}
                network={network}
                IconButtonProps={{ size: "medium" }}
              />
            )}
          </Stack>
        </Stack>

        <Stack alignItems="center" gap={1} sx={{ mb: 4 }}>
          {isBelowMd && !isActive && updatedAtTimestamp && (
            <CancelledIndicator updatedAtTimestamp={updatedAtTimestamp} />
          )}

          <Typography variant="h5">Total Amount Streamed</Typography>

          <Stack direction="row" alignItems="center" gap={2}>
            {!isBelowMd && (
              <TokenIcon tokenSymbol={tokenSymbol} size={isBelowMd ? 32 : 60} />
            )}
            <Stack
              direction="row"
              alignItems="end"
              flexWrap="wrap"
              columnGap={2}
            >
              <Typography
                variant={isBelowMd ? "h2mono" : "h1mono"}
                sx={{
                  [theme.breakpoints.up("md")]: {
                    lineHeight: "48px",
                  },
                }}
              >
                <FlowingBalance
                  balance={streamedUntilUpdatedAt}
                  flowRate={currentFlowRate}
                  balanceTimestamp={updatedAtTimestamp}
                  disableRoundingIndicator
                />
              </Typography>
              {!isBelowMd && (
                <Typography
                  variant="h3"
                  color="primary"
                  sx={{ lineHeight: "28px" }}
                >
                  {tokenSymbol}
                </Typography>
              )}
            </Stack>
          </Stack>
          {isBelowMd && (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              gap={1}
            >
              <TokenIcon tokenSymbol={tokenSymbol} size={isBelowMd ? 32 : 60} />
              <Typography
                variant="h3"
                color="primary"
                sx={{ lineHeight: "28px" }}
              >
                {tokenSymbol}
              </Typography>
            </Stack>
          )}

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
            [theme.breakpoints.down("md")]: {
              gridTemplateColumns: "1fr 32px 1fr",
              rowGap: 1,
            },
          }}
        >
          <Typography variant="h6" sx={{ pl: 1 }}>
            Sender
          </Typography>
          <Box />
          <Typography variant="h6" sx={{ pl: 1 }}>
            Receiver
          </Typography>

          <StreamAccountCard address={sender} />

          <Box sx={{ mx: -0.25, height: isBelowMd ? 24 : 48, zIndex: -1 }}>
            <Image
              unoptimized
              src="/gifs/stream-loop.gif"
              width={isBelowMd ? 46 : 92}
              height={isBelowMd ? 24 : 48}
              layout="fixed"
              alt="Superfluid stream"
            />
          </Box>

          <StreamAccountCard address={receiver} />
        </Stack>

        {currentFlowRate !== "0" && (
          <Stack direction="row" alignItems="center" gap={0.5}>
            <Typography variant="h6">
              <Ether
                wei={BigNumber.from(currentFlowRate).mul(UnitOfTime.Month)}
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
            [theme.breakpoints.down("md")]: {
              gridTemplateColumns: "1fr",
              mt: 4,
            },
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
                  <Ether wei={bufferSize} /> {tokenSymbol}
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
          {/* <OverviewItem
            label="Transaction ID:"
            value={shortenHex(streamId, 6)}
          /> */}
        </Stack>

        <Divider sx={{ maxWidth: "375px", width: "100%", my: 1 }} />

        <Stack direction="row" alignItems="center" gap={1}>
          <ShareIcon sx={{ width: 18, height: 18 }} />
          <Typography variant="h5" sx={{ mr: 1 }}>
            Share:
          </Typography>

          <CopyTooltip
            content={urlToShare}
            copyText="Copy link"
            TooltipProps={{ placement: "top" }}
          >
            {({ copy }) => (
              <IconButton
                onClick={copy}
                sx={{
                  color: "#fff",
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.primary.main,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.main,
                  },
                }}
              >
                <LinkIcon
                  sx={{ transform: "rotate(135deg)", width: 20, height: 20 }}
                />
              </IconButton>
            )}
          </CopyTooltip>

          <ShareButton
            imgSrc="/icons/social/twitter.svg"
            alt="Twitter logo"
            tooltip="Share on Twitter"
            href={`https://twitter.com/intent/tweet?text=${TEXT_TO_SHARE}&url=${encodedUrlToShare}`}
          />
          {/* <ShareButton imgSrc="/icons/social/discord.svg" alt="Discord logo" /> */}
          <ShareButton
            imgSrc="/icons/social/telegram.svg"
            alt="Telegram logo"
            tooltip="Share on Telegram"
            href={`https://t.me/share/url?text=${TEXT_TO_SHARE}&url=${encodedUrlToShare}`}
          />
        </Stack>
      </Stack>
    </Container>
  );
};

export default StreamPage;
