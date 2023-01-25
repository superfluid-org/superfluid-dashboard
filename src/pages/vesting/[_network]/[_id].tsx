import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query/react";
import { FlowUpdatedEvent, TransferEvent } from "@superfluid-finance/sdk-core";
import { isString, orderBy } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { FC, useEffect, useMemo, useState } from "react";
import ActivityTable from "../../../features/activityHistory/ActivityTable";
import TimeUnitFilter, {
  TimeUnitFilterType,
} from "../../../features/graph/TimeUnitFilter";
import { Network, networksBySlug } from "../../../features/network/networks";
import { subgraphApi } from "../../../features/redux/store";
import Amount from "../../../features/token/Amount";
import FiatAmount from "../../../features/tokenPrice/FiatAmount";
import FlowingFiatBalance from "../../../features/tokenPrice/FlowingFiatBalance";
import useTokenPrice from "../../../features/tokenPrice/useTokenPrice";
import { BigLoader } from "../../../features/vesting/BigLoader";
import { useVestingToken } from "../../../features/vesting/useVestingToken";
import VestedBalance from "../../../features/vesting/VestedBalance";
import VestingDataCard from "../../../features/vesting/VestingDataCard";
import VestingDetailsHeader from "../../../features/vesting/VestingDetailsHeader";
import VestingGraph from "../../../features/vesting/VestingGraph";
import VestingScheduleProgress from "../../../features/vesting/VestingScheduleProgress/VestingScheduleProgress";
import {
  Activity,
  mapActivitiesFromEvents,
} from "../../../utils/activityUtils";
import { calculateVestingScheduleAllocated } from "../../../utils/vestingUtils";
import { vestingSubgraphApi } from "../../../vesting-subgraph/vestingSubgraphApi";
import Page404 from "../../404";

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
)[];

const VestingScheduleDetailsPage: NextPage = () => {
  const router = useRouter();

  const [routeHandled, setRouteHandled] = useState(false);

  const [network, setNetwork] = useState<Network | undefined>();
  const [vestingScheduleId, setVestingScheduleId] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (router.isReady) {
      setNetwork(
        networksBySlug.get(
          isString(router.query._network) ? router.query._network : ""
        )
      );
      setVestingScheduleId(
        isString(router.query._id) ? router.query._id : undefined
      );
      setRouteHandled(true);
    }
  }, [setRouteHandled, router.isReady, router.query._token]);

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

  const vestingScheduleQuery = vestingSubgraphApi.useGetVestingScheduleQuery({
    chainId: network.id,
    id,
  });

  const vestingSchedule = vestingScheduleQuery.data?.vestingSchedule;

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
            timestamp_gte:
              vestingSchedule.cliffAndFlowExecutedAt?.toString() ??
              vestingSchedule.startDate.toString(), // TODO(KK): Probably safe to always look from "start date"?
            timestamp_lte:
              vestingSchedule.endExecutedAt?.toString() ??
              vestingSchedule.endDate.toString(), // TODO(KK): Use now over "end date"?
          },
        }
      : skipToken,
    {
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

  const tokenQuery = useVestingToken(network, vestingSchedule?.superToken);

  const token = tokenQuery.data;

  const tokenPrice = useTokenPrice(network.id, token?.underlyingAddress);

  const onGraphFilterChange = (newGraphFilter: TimeUnitFilterType) =>
    setGraphFilter(newGraphFilter);

  const expectedVestedBalance = useMemo(() => {
    if (!vestingSchedule) return undefined;
    return calculateVestingScheduleAllocated(vestingSchedule).toString();
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
                      balanceTimestamp={
                        vestingSchedule.cliffAndFlowDate
                      }
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

        <Stack direction="row" alignItems="stretch" gap={3}>
          <VestingDataCard
            title="Tokens Allocated"
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
            tokenSymbol={token.symbol}
            tokenAmount={<Amount wei={vestingSchedule.cliffAmount} />}
            fiatAmount={
              tokenPrice && (
                <FiatAmount wei={expectedVestedBalance} price={tokenPrice} />
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

        {activities.length > 0 && <ActivityTable activities={activities} />}
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

export default VestingScheduleDetailsPage;
