import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";

import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
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
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import AddressAvatar from "../../../components/AddressAvatar/AddressAvatar";
import CopyTooltip from "../../../components/CopyTooltip/CopyTooltip";
import SEO from "../../../components/SEO/SEO";
import withStaticSEO from "../../../components/SEO/withStaticSEO";
import NetworkIcon from "../../../features/network/NetworkIcon";
import { Network, networksBySlug } from "../../../features/network/networks";
import { subgraphApi } from "../../../features/redux/store";
import { UnitOfTime } from "../../../features/send/FlowRateInput";
import CancelStreamButton from "../../../features/streamsTable/CancelStreamButton/CancelStreamButton";
import ModifyStreamButton from "../../../features/streamsTable/ModifyStreamButton";
import Amount from "../../../features/token/Amount";
import FlowingBalance from "../../../features/token/FlowingBalance";
import TokenIcon from "../../../features/token/TokenIcon";
import { useTokenIsListed } from "../../../features/token/useTokenIsListed";
import useAddressName from "../../../hooks/useAddressName";
import useNavigateBack from "../../../hooks/useNavigateBack";
import config from "../../../utils/config";
import shortenHex from "../../../utils/shortenHex";
import {
  calculateBuffer,
  calculateMaybeCriticalAtTimestamp,
} from "../../../utils/tokenUtils";
import Page404 from "../../404";

const TEXT_TO_SHARE = (up?: boolean) =>
  encodeURIComponent(`I’m streaming money every second with @Superfluid_HQ! 🌊

Check out my stream here ${up ? "☝️" : "👇"}`);

const HASHTAGS_TO_SHARE = encodeURIComponent(
  ["superfluid", "moneystreaming", "realtimefinance"].join(",")
);

interface StreamAccountCardProps {
  address: Address;
  network: Network;
}

const StreamAccountCard: FC<StreamAccountCardProps> = ({
  address,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { ensName, addressChecksummed } = useAddressName(address);

  const [isHovering, setIsHovering] = useState(false);

  const onMouseOver = () => setIsHovering(true);
  const onMouseLeave = () => setIsHovering(false);

  return (
    <Stack flex={1} gap={2}>
      <Paper
        component={Stack}
        direction="row"
        alignItems="center"
        gap={isBelowMd ? 1 : 2}
        sx={{
          height: "70px",
          px: 3,
          [theme.breakpoints.down("md")]: {
            height: "52px",
            px: 2,
            borderRadius: "8px",
          },
        }}
        onMouseOver={onMouseOver}
        onMouseLeave={onMouseLeave}
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
          data-cy={"sender-and-receiver"}
          primary={ensName || shortenHex(addressChecksummed, 4)}
          secondary={!!ensName && shortenHex(addressChecksummed, 4)}
          primaryTypographyProps={{ variant: isBelowMd ? "h7" : "h6" }}
        />

        {!isBelowMd && (
          <Stack
            direction="row"
            alignItems="center"
            sx={{
              color: theme.palette.text.secondary,
              opacity: isHovering ? 1 : 0,
              pointerEvents: isHovering ? "all" : "none",
              transition: theme.transitions.create("opacity", {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.short,
              }),
            }}
          >
            <CopyTooltip content={addressChecksummed} copyText="Copy address" />

            <Tooltip title="View on blockchain explorer" arrow placement="top">
              <span>
                <Link
                  data-cy="sender-and-receiver-explorer-links"
                  href={network.getLinkForAddress(addressChecksummed)}
                  passHref
                >
                  <IconButton component="a" size="small" target="_blank">
                    <LaunchRoundedIcon />
                  </IconButton>
                </Link>
              </span>
            </Tooltip>
          </Stack>
        )}
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
      <Typography
        data-cy={"ended-stream-message"}
        variant={isBelowMd ? "h6" : "h5"}
        color="error"
        translate="yes"
      >
        <span>Cancelled on</span>{" "}
        <span translate="no">
          {format(updatedAtTimestamp * 1000, "d MMMM yyyy")}
        </span>{" "}
        <span>at</span>{" "}
        <span translate="no">
          {format(updatedAtTimestamp * 1000, "h:mm aaa")}
        </span>
      </Typography>
    </Stack>
  );
};

interface ShareButtonProps {
  imgSrc: string;
  alt: string;
  tooltip: string;
  href?: string;
  dataCy?: string;
}

const ShareButton: FC<ShareButtonProps> = ({
  imgSrc,
  alt,
  tooltip,
  href,
  dataCy,
}) => (
  <Tooltip title={tooltip} arrow placement="top">
    <MuiLink data-cy={dataCy} href={href} target="_blank">
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
  dataCy?: string;
}

const OverviewItem: FC<OverviewItemProps> = ({ label, value, dataCy }) => (
  <Stack direction="row" alignItems="center" justifyContent="space-between">
    <Typography variant="body1" color="text.secondary" translate="yes">
      {label}
    </Typography>
    <Typography data-cy={dataCy} variant="h6">
      {value}
    </Typography>
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
  const [routeHandled, setRouteHandled] = useState(false);

  const [network, setNetwork] = useState<Network | undefined>();
  const [streamId, setStreamId] = useState<string | undefined>();
  const [queryStreams, streamTxQuery] = subgraphApi.useLazyStreamsQuery();

  useEffect(() => {
    if (router.isReady) {
      const network = networksBySlug.get(
        isString(router.query._network) ? router.query._network : ""
      );
      setNetwork(network);

      if (network && isString(router.query._stream)) {
        // The "_stream" in the path can either be Subgraph ID or "{tx-log}" (txId). If it's a transaction ID then we will find the Subgraph ID.
        const _streamSplit = router.query._stream.split("-");
        const isTxId = _streamSplit.length === 2;
        if (isTxId) {
          const [transactionHash, logIndex] = _streamSplit;
          // NOTE: Check V1StreamPage before changing this query.
          queryStreams(
            {
              chainId: network.id,
              filter: {
                flowUpdatedEvents_: {
                  transactionHash,
                  logIndex,
                },
              },
              pagination: {
                take: 1,
              },
            },
            true
          );
        } else {
          setStreamId(router.query._stream.toLowerCase());
        }
      }

      setRouteHandled(true);
    }
  }, [setRouteHandled, router.isReady, router.query._stream]);

  // `streamTxQuery` will have a value when it's successfully loaded. If it's unsuccessful then the logic will go to 404.
  if (!streamId && streamTxQuery?.data?.items?.[0]?.id) {
    setStreamId(streamTxQuery.data.items[0].id);
  }

  const isPageReady = routeHandled && !streamTxQuery.isLoading;
  if (!isPageReady) return <Container maxWidth="lg" />;

  if (network && streamId) {
    return (
      <StreamPageContent key={streamId} network={network} streamId={streamId} />
    );
  } else {
    return <Page404 />;
  }
};

const StreamPageContent: FC<{
  network: Network;
  streamId: string;
}> = ({ network, streamId }) => {
  const router = useRouter();
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { address: accountAddress } = useAccount();
  const { chain: activeChain } = useNetwork();
  const navigateBack = useNavigateBack();

  const [senderAddress = "", receiverAddress, tokenAddress = ""] =
    streamId.split("-");

  const [isTokenListed, isTokenListedLoading] = useTokenIsListed(
    network.id,
    tokenAddress
  );

  const streamQuery = subgraphApi.useStreamQuery({
    chainId: network.id,
    id: streamId,
  });

  const tokenSnapshotQuery = subgraphApi.useAccountTokenSnapshotQuery({
    chainId: network.id,
    id: `${senderAddress.toLowerCase()}-${tokenAddress.toLowerCase()}`,
  });

  const { streamCreationEvent } = subgraphApi.useFlowUpdatedEventsQuery(
    {
      chainId: network.id,
      order: {
        orderDirection: "asc",
        orderBy: "order",
      },
      filter: {
        stream: streamId,
      },
      pagination: {
        take: 1,
      },
    },
    {
      selectFromResult: ({ data }) => ({
        streamCreationEvent: data?.items?.[0],
      }),
    }
  );

  const liquidationDate = useMemo(() => {
    if (!tokenSnapshotQuery.data) return null;
    const {
      balanceUntilUpdatedAt,
      totalNetFlowRate,
      updatedAtTimestamp: snapshotUpdatedAtTimestamp,
    } = tokenSnapshotQuery.data;

    const criticalAtTimestamp = calculateMaybeCriticalAtTimestamp({
      updatedAtTimestamp: snapshotUpdatedAtTimestamp,
      balanceUntilUpdatedAtWei: balanceUntilUpdatedAt,
      totalNetFlowRateWei: totalNetFlowRate,
    }).toNumber();

    return criticalAtTimestamp ? new Date(criticalAtTimestamp * 1000) : null;
  }, [tokenSnapshotQuery.data]);

  const txIdOrSubgraphId = streamCreationEvent
    ? `${streamCreationEvent.transactionHash}-${streamCreationEvent.logIndex}`
    : streamId;

  const urlToShare = `${config.appUrl}${getStreamPagePath({
    network: network.slugName,
    stream: txIdOrSubgraphId,
  })}`;

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

  if (streamQuery.isLoading || tokenSnapshotQuery.isLoading) {
    return (
      <SEO ogUrl={urlToShare}>
        <Container maxWidth="lg" />
      </SEO>
    );
  }

  if (!streamQuery.data || !tokenSnapshotQuery.data) {
    return <Page404 />;
  }

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
    <SEO ogUrl={urlToShare}>
      <Container maxWidth="lg">
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
              <IconButton
                data-cy={"back-button"}
                color="inherit"
                onClick={navigateBack}
              >
                <ArrowBackIcon />
              </IconButton>
            </Box>

            <Box flex={1}>
              {!isBelowMd && !isActive && updatedAtTimestamp && (
                <CancelledIndicator updatedAtTimestamp={updatedAtTimestamp} />
              )}
            </Box>

            <Stack direction="row" justifyContent="flex-end" gap={1}>
              {!!accountAddress && (
                <>
                  {isOutgoing && (
                    <ModifyStreamButton
                      stream={streamQuery.data}
                      network={network}
                    />
                  )}
                  {isActive && (
                    <CancelStreamButton
                      data-cy={"cancel-button"}
                      stream={streamQuery.data}
                      network={network}
                    />
                  )}
                </>
              )}
            </Stack>
          </Stack>

          <Stack alignItems="center" gap={1} sx={{ mb: 4 }}>
            {isBelowMd && !isActive && updatedAtTimestamp && (
              <CancelledIndicator updatedAtTimestamp={updatedAtTimestamp} />
            )}

            <Typography variant="h5" translate="yes">
              Total Amount Streamed
            </Typography>

            <Stack direction="row" alignItems="center" gap={2}>
              {!isBelowMd && (
                <TokenIcon
                  isSuper
                  tokenSymbol={tokenSymbol}
                  isUnlisted={!isTokenListed}
                  isLoading={isTokenListedLoading}
                  size={isBelowMd ? 32 : 60}
                />
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
                    data-cy={"streamed-so-far"}
                    balance={streamedUntilUpdatedAt}
                    flowRate={currentFlowRate}
                    balanceTimestamp={updatedAtTimestamp}
                    disableRoundingIndicator
                  />
                </Typography>
                {!isBelowMd && (
                  <Typography
                    data-cy={"streamed-token"}
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
                <TokenIcon
                  isSuper
                  tokenSymbol={tokenSymbol}
                  isUnlisted={!isTokenListed}
                  isLoading={isTokenListedLoading}
                  size={isBelowMd ? 32 : 60}
                />
                <Typography
                  data-cy={"token-symbol"}
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
            <Typography variant="h6" sx={{ pl: 1 }} translate="yes">
              Sender
            </Typography>
            <Box />
            <Typography variant="h6" sx={{ pl: 1 }} translate="yes">
              Receiver
            </Typography>

            <StreamAccountCard address={sender} network={network} />

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

            <StreamAccountCard address={receiver} network={network} />
          </Stack>

          {currentFlowRate !== "0" && (
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Typography data-cy={"amount-per-month"} variant="h6">
                <Amount
                  wei={BigNumber.from(currentFlowRate).mul(UnitOfTime.Month)}
                >
                  {` ${tokenSymbol}`}
                </Amount>
              </Typography>

              <Typography variant="h6" color="text.secondary" translate="yes">
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
              dataCy={"start-date"}
              label="Start Date:"
              value={format(createdAtTimestamp * 1000, "d MMM. yyyy H:mm")}
            />
            <OverviewItem
              dataCy={"buffer"}
              label="Buffer:"
              value={
                bufferSize ? (
                  <>
                    <Amount wei={bufferSize} /> {tokenSymbol}
                  </>
                ) : (
                  "-"
                )
              }
            />
            <OverviewItem
              dataCy={"updated-end-date"}
              label={`${isActive ? "Updated" : "End"} Date:`}
              value={
                updatedAtTimestamp
                  ? format(updatedAtTimestamp * 1000, "d MMM. yyyy H:mm")
                  : "-"
              }
            />
            <OverviewItem
              dataCy={"network-name"}
              label="Network Name:"
              value={
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <NetworkIcon network={network} size={16} fontSize={12} />
                  <Typography variant="h6">{network.name}</Typography>
                </Stack>
              }
            />
            <OverviewItem
              dataCy={"projected-liquidation"}
              label="Projected Liquidation:"
              value={
                isActive && liquidationDate
                  ? format(liquidationDate, "d MMM. yyyy H:mm")
                  : "-"
              }
            />
            <OverviewItem
              dataCy={"tx-hash"}
              label="Transaction Hash:"
              value={
                streamCreationEvent && (
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    {shortenHex(streamCreationEvent.transactionHash)}
                    <Stack
                      direction="row"
                      alignItems="center"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      <CopyTooltip
                        content={streamCreationEvent.transactionHash}
                        copyText="Copy transaction hash"
                      />

                      <Tooltip
                        title="View on blockchain explorer"
                        arrow
                        placement="top"
                      >
                        <span>
                          <Link
                            data-cy={"tx-hash-link"}
                            href={network.getLinkForTransaction(
                              streamCreationEvent.transactionHash
                            )}
                            passHref
                          >
                            <IconButton
                              component="a"
                              size="small"
                              target="_blank"
                            >
                              <LaunchRoundedIcon />
                            </IconButton>
                          </Link>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Stack>
                )
              }
            />
          </Stack>

          <Divider sx={{ maxWidth: "375px", width: "100%", my: 1 }} />

          <Stack direction="row" alignItems="center" gap={1}>
            <ShareIcon sx={{ width: 18, height: 18 }} />
            <Typography variant="h5" translate="yes" sx={{ mr: 1 }}>
              Share:
            </Typography>

            <CopyTooltip content={urlToShare} copyText="Copy link">
              {({ copy }) => (
                <IconButton
                  data-cy={"copy-button"}
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
              dataCy={"twitter-button"}
              imgSrc="/icons/social/twitter.svg"
              alt="Twitter logo"
              tooltip="Share on Twitter"
              href={`https://twitter.com/intent/tweet?text=${TEXT_TO_SHARE()}&url=${encodedUrlToShare}&hashtags=${HASHTAGS_TO_SHARE}`}
            />
            {/* <ShareButton imgSrc="/icons/social/discord.svg" alt="Discord logo" /> */}
            <ShareButton
              dataCy={"telegram-button"}
              imgSrc="/icons/social/telegram.svg"
              alt="Telegram logo"
              tooltip="Share on Telegram"
              href={`https://t.me/share/url?text=${TEXT_TO_SHARE(
                true
              )}&url=${encodedUrlToShare}`}
            />
          </Stack>
        </Stack>
      </Container>
    </SEO>
  );
};

export default withStaticSEO(
  {
    title: "Stream Details | Superfluid",
    ogImage: `${config.appUrl}/images/stream.jpg`,
  },
  StreamPage
);
