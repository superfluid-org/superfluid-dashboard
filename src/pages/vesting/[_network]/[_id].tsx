import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/query/react";
import { FlowUpdatedEvent, TransferEvent } from "@superfluid-finance/sdk-core";
import { isString, orderBy } from "lodash";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import withStaticSEO from "../../../components/SEO/withStaticSEO";
import ActivityTable from "../../../features/activityHistory/ActivityTable";
import TimeUnitFilter, {
  TimeUnitFilterType,
} from "../../../features/graph/TimeUnitFilter";
import {
  Network,
  allNetworks,
  tryFindNetwork,
} from "../../../features/network/networks";
import { subgraphApi } from "../../../features/redux/store";
import Amount from "../../../features/token/Amount";
import FiatAmount from "../../../features/tokenPrice/FiatAmount";
import FlowingFiatBalance from "../../../features/tokenPrice/FlowingFiatBalance";
import useTokenPrice from "../../../features/tokenPrice/useTokenPrice";
import { BigLoader } from "../../../features/vesting/BigLoader";
import VestedBalance from "../../../features/vesting/VestedBalance";
import VestingDataCard from "../../../features/vesting/VestingDataCard";
import VestingDetailsHeader from "../../../features/vesting/VestingDetailsHeader";
import VestingGraph from "../../../features/vesting/VestingGraph";
import VestingScheduleProgress from "../../../features/vesting/VestingScheduleProgress/VestingScheduleProgress";
import {
  Activity,
  mapActivitiesFromEvents,
} from "../../../utils/activityUtils";
import { dateNowSeconds } from "../../../utils/dateUtils";
import { vestingSubgraphApi } from "../../../vesting-subgraph/vestingSubgraphApi";
import Page404 from "../../404";
import { NextPageWithLayout } from "../../_app";
import { useTokenQuery } from "../../../hooks/useTokenQuery";
import { VestingScheduleUpdatedEvent } from "../../../vesting-subgraph/vestingEvents";

interface VestingLegendItemProps {
  title: string;
  color: string;
}

const VestingLegendItem: FC<VestingLegendItemProps> = ({ title, color }) => (
  <Stack direction="row" gap={0.5} alignItems="center">
    <Box
      sx={{
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        background: color,
      }}
    />
    <Typography>{title}</Typography>
  </Stack>
);

export type VestingActivities = (
  | Activity<FlowUpdatedEvent>
  | Activity<TransferEvent>
  // | Activity<VestingScheduleUpdatedEvent>
)[];

const VestingScheduleDetailsPage: NextPageWithLayout = () => {
  const router = useRouter();

  const [routeHandled, setRouteHandled] = useState(false);

  const [network, setNetwork] = useState<Network | undefined>();
  const [vestingScheduleId, setVestingScheduleId] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (router.isReady) {
      setNetwork(tryFindNetwork(allNetworks, router.query._network));
      setVestingScheduleId(
        isString(router.query._id) ? router.query._id : undefined
      );
      setRouteHandled(true);
    }
  }, [router.isReady, router.query._network, router.query._id]);

  const isPageReady = routeHandled;
  if (!isPageReady) {
    return <BigLoader />;
  }

  if (!network || !vestingScheduleId) {
    return <Page404 />;
  }

  return (
    <VestingScheduleDetailsContent id={vestingScheduleId} network={network} />
  );
};

interface VestingScheduleDetailsContentProps {
  id: string;
  network: Network;
}

const VestingScheduleDetailsContent: FC<VestingScheduleDetailsContentProps> = ({
  id,
  network,
}) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [graphFilter, setGraphFilter] = useState(TimeUnitFilterType.All);

  const vestingScheduleQuery = vestingSubgraphApi.useGetVestingScheduleQuery(
    {
      chainId: network.id,
      id,
    },
    {
      refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
    }
  );

  const vestingSchedule = vestingScheduleQuery.data?.vestingSchedule;
  const now = dateNowSeconds();

  // Extreme edge-case: Handle a situation where stream is manually cancelled after the vesting ends.
  const { lastVestingStreamPeriod } = subgraphApi.useStreamPeriodsQuery(
    vestingSchedule && now > vestingSchedule.endDate
      ? {
          chainId: network.id,
          order: {
            orderBy: "startedAtTimestamp",
            orderDirection: "desc",
          },
          filter: {
            token: vestingSchedule.superToken,
            sender: vestingSchedule.sender,
            receiver: vestingSchedule.receiver,
            startedAtTimestamp_lte: vestingSchedule.endDate.toString(),
          },
          pagination: {
            take: 1,
          },
        }
      : skipToken,
    {
      selectFromResult: ({ data }) => ({
        lastVestingStreamPeriod: data?.items?.[0] ?? null,
      }),
    }
  );

  // Extreme edge-case: Handle a situation where stream was flowing already before vesting started.
  const { beforeVestingStreamPeriod } = subgraphApi.useStreamPeriodsQuery(
    vestingSchedule && now > vestingSchedule.endDate
      ? {
          chainId: network.id,
          order: {
            orderBy: "startedAtTimestamp",
            orderDirection: "desc",
          },
          filter: {
            token: vestingSchedule.superToken,
            sender: vestingSchedule.sender,
            receiver: vestingSchedule.receiver,
            startedAtTimestamp_lt: vestingSchedule.startDate.toString(),
          },
          pagination: {
            take: 1,
          },
        }
      : skipToken,
    {
      selectFromResult: ({ data }) => {
        const possiblyTooEarlyStreamPeriod = data?.items?.[0] ?? null;
        if (vestingSchedule && possiblyTooEarlyStreamPeriod) {
          const isStillFlowing =
            !possiblyTooEarlyStreamPeriod.stoppedAtTimestamp;
          const stoppedAfterVestingStart =
            vestingSchedule.startDate <
            (possiblyTooEarlyStreamPeriod?.stoppedAtTimestamp ?? 0);
          if (isStillFlowing || stoppedAfterVestingStart) {
            return {
              beforeVestingStreamPeriod: possiblyTooEarlyStreamPeriod,
            };
          }
        }
        return {
          beforeVestingStreamPeriod: null,
        };
      },
    }
  );

  const { activities, ...vestingEventsQuery } = subgraphApi.useEventsQuery(
    vestingSchedule
      ? {
          chainId: network.id,
          filter: {
            name_in: ["FlowUpdated", "Transfer"],
            addresses_contains_nocase: [
              vestingSchedule.superToken,
              vestingSchedule.sender,
              vestingSchedule.receiver,
            ],
            timestamp_gte: beforeVestingStreamPeriod
              ? beforeVestingStreamPeriod.startedAtTimestamp.toString()
              : vestingSchedule.startDate.toString(),
            timestamp_lte:
              vestingSchedule.endExecutedAt?.toString() ??
              (lastVestingStreamPeriod
                ? lastVestingStreamPeriod.stoppedAtTimestamp?.toString() ??
                  dateNowSeconds.toString()
                : vestingSchedule.endDate.toString()),
          },
        }
      : skipToken,
    {
      refetchOnFocus: true, // Re-fetch list view more often where there might be something incoming.
      selectFromResult: (result) => ({
        ...result,
        activities: orderBy(
          mapActivitiesFromEvents(result.data?.items || [], network),
          (activity) => activity.keyEvent.order,
          "desc"
        ) as VestingActivities,
      }),
    }
  );

  const tokenQuery = useTokenQuery(vestingSchedule ? {
    chainId: network.id,
    id: vestingSchedule?.superToken,
    onlySuperToken: true
  } : skipToken);
  const tokenPrice = useTokenPrice(network.id, vestingSchedule?.superToken);

  const token = tokenQuery.data;

  const onGraphFilterChange = (newGraphFilter: TimeUnitFilterType) =>
    setGraphFilter(newGraphFilter);

  const expectedVestedBalance = useMemo(() => {
    if (!vestingSchedule) return undefined;
    return vestingSchedule.totalAmount;
  }, [vestingSchedule]);

  if (vestingScheduleQuery.isLoading || tokenQuery.isLoading) {
    return <BigLoader />;
  }

  if (!vestingSchedule || !token) return <Page404 />;

  // const urlToShare = `${config.appUrl}/vesting/${network.slugName}/${id}`;

  return (
    <Container maxWidth="lg">
      <VestingDetailsHeader
        network={network}
        vestingSchedule={vestingSchedule}
        token={token}
      />

      <Stack gap={3}>
        <Card
          sx={{
            pb: 2,
            [theme.breakpoints.down("md")]: {
              p: 2,
              mx: -2,
              border: 0,
              background: "transparent",
              boxShadow: "none",
            },
          }}
        >
          <Stack
            data-cy={"token-container-by-graph"}
            direction="row"
            justifyContent="space-between"
            alignItems="start"
            sx={{
              mb: 4,
              [theme.breakpoints.down("md")]: {
                mb: 0,
                alignItems: "end",
              },
            }}
          >
            <Stack gap={0.5}>
              <Typography
                variant={isBelowMd ? "body2" : "body1"}
                color="text.secondary"
                translate="yes"
              >
                Vested so far
              </Typography>
              <Box>
                <Stack direction="row" alignItems="flex-end" columnGap={1}>
                  <Typography
                    data-cy={"token-balance"}
                    variant="h3mono"
                    sx={{ lineHeight: "36px" }}
                  >
                    <VestedBalance vestingSchedule={vestingSchedule} />
                  </Typography>
                  <Typography
                    data-cy={"token-symbol"}
                    variant="h5mono"
                    color="text.secondary"
                  >
                    {token.symbol}
                  </Typography>
                </Stack>

                {tokenPrice && (
                  <Typography
                    data-cy={"token-fiat-balance"}
                    variant="h5mono"
                    color="text.secondary"
                  >
                    <FlowingFiatBalance
                      balance={vestingSchedule.cliffAmount}
                      flowRate={vestingSchedule.flowRate}
                      balanceTimestamp={vestingSchedule.cliffAndFlowDate}
                      price={tokenPrice}
                    />
                  </Typography>
                )}
              </Box>
            </Stack>

            {!isBelowMd && (
              <Stack alignItems="end" gap={2}>
                <TimeUnitFilter
                  activeFilter={graphFilter}
                  onChange={onGraphFilterChange}
                />
                <Stack direction="row" gap={2}>
                  <VestingLegendItem
                    title="Vested"
                    color={theme.palette.primary.main}
                  />
                  <VestingLegendItem
                    title="Expected"
                    color={theme.palette.text.disabled}
                  />
                </Stack>
              </Stack>
            )}
          </Stack>

          <VestingGraph
            vestingSchedule={vestingSchedule}
            vestingActivities={activities}
            filter={graphFilter}
          />
        </Card>

        <Stack
          direction={isBelowMd ? "column" : "row"}
          alignItems="stretch"
          gap={3}
        >
          <VestingDataCard
            title="Tokens Allocated"
            chainId={network.id}
            tokenAddress={token.address}
            dataCy={`${token.symbol}-allocated`}
            tokenSymbol={token.symbol}
            tokenAmount={<Amount wei={expectedVestedBalance || "0"} />}
            fiatAmount={
              tokenPrice && (
                <FiatAmount
                  wei={expectedVestedBalance || "0"}
                  price={tokenPrice}
                />
              )
            }
          />
          <VestingDataCard
            title="Cliff Amount"
            chainId={network.id}
            tokenAddress={token.address}
            dataCy={`${token.symbol}-cliff-amount`}
            tokenSymbol={token.symbol}
            tokenAmount={<Amount wei={vestingSchedule.cliffAmount} />}
            fiatAmount={
              tokenPrice && (
                <FiatAmount
                  wei={vestingSchedule.cliffAmount}
                  price={tokenPrice}
                />
              )
            }
          />
        </Stack>

        <Card sx={{ p: 3.5, flex: 1 }}>
          <Stack gap={2}>
            <Typography variant="h5">Schedule</Typography>
            <VestingScheduleProgress vestingSchedule={vestingSchedule} />
          </Stack>
        </Card>

        {activities.length > 0 && (
          <ActivityTable
            activities={activities}
            dateFormat="d MMM yyyy HH:mm"
          />
        )}
        {/* <SharingSection
          url={urlToShare}
          twitterText="Start vesting with Superfluid!"
          telegramText="Start vesting with Superfluid!"
          twitterHashtags="Superfluid,Vesting"
        /> */}
      </Stack>
    </Container>
  );
};

export default withStaticSEO(
  { title: "Vesting Schedule | Superfluid" },
  VestingScheduleDetailsPage
);
