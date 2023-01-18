import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ListItemText from "@mui/material/ListItemText";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { skipToken } from "@reduxjs/toolkit/dist/query/react";
import { format, fromUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { isString } from "lodash";
import { NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import AddressName from "../../../components/AddressName/AddressName";
import AddressAvatar from "../../../components/Avatar/AddressAvatar";
import ActivityTable from "../../../features/activityHistory/ActivityTable";
import AddressCopyTooltip from "../../../features/common/AddressCopyTooltip";
import TimeUnitFilter, {
  TimeUnitFilterType,
} from "../../../features/graph/TimeUnitFilter";
import { Network, networksBySlug } from "../../../features/network/networks";
import { subgraphApi } from "../../../features/redux/store";
import Amount from "../../../features/token/Amount";
import TokenIcon from "../../../features/token/TokenIcon";
import FiatAmount from "../../../features/tokenPrice/FiatAmount";
import FlowingFiatBalance from "../../../features/tokenPrice/FlowingFiatBalance";
import useTokenPrice from "../../../features/tokenPrice/useTokenPrice";
import { BigLoader } from "../../../features/vesting/BigLoader";
import { useVestingToken } from "../../../features/vesting/useVestingToken";
import VestedBalance from "../../../features/vesting/VestedBalance";
import VestingDetailsHeader from "../../../features/vesting/VestingDetailsHeader";
import VestingGraph from "../../../features/vesting/VestingGraph";
import VestingScheduleProgress from "../../../features/vesting/VestingScheduleProgress/VestingScheduleProgress";
import VestingStatus from "../../../features/vesting/VestingStatus";
import { useVisibleAddress } from "../../../features/wallet/VisibleAddressContext";
import { mapActivitiesFromEvents } from "../../../utils/activityUtils";
import config from "../../../utils/config";
import { vestingSubgraphApi } from "../../../vesting-subgraph/vestingSubgraphApi";
import Page404 from "../../404";
import { getStreamPagePath } from "../../stream/[_network]/[_stream]";

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

interface VestingDataCardProps {
  title: string;
  tokenSymbol: string;
  amount?: string;
  price?: number;
}

const VestingDataCard: FC<VestingDataCardProps> = ({
  title,
  tokenSymbol,
  amount,
  price,
}) => (
  <Card sx={{ p: 3.5, flex: 1 }}>
    <Typography variant="h5">{title}</Typography>
    <Stack direction="row" alignItems="center" gap={1.5}>
      <TokenIcon isSuper tokenSymbol={tokenSymbol} />
      <Stack direction="row" alignItems="flex-end" gap={0.5}>
        {amount && (
          <Typography variant="h3mono">
            <Amount wei={amount} />
          </Typography>
        )}{" "}
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ lineHeight: "30px" }}
        >
          {tokenSymbol}
        </Typography>
        {amount && price && (
          <Typography>
            <FiatAmount wei={amount} price={price} />
          </Typography>
        )}
      </Stack>
    </Stack>
  </Card>
);

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
  const { visibleAddress = "" } = useVisibleAddress();
  const router = useRouter();

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
            addresses_contains_nocase: [
              vestingSchedule.superToken,
              vestingSchedule.sender,
              vestingSchedule.receiver,
            ],
            timestamp_gte:
              vestingSchedule.cliffAndFlowExecutedAt ||
              vestingSchedule.startDate,
            timestamp_lte:
              vestingSchedule.endExecutedAt || vestingSchedule.endDate,
          },
          order: {
            orderBy: "order",
            orderDirection: "desc",
          },
        }
      : skipToken,
    {
      selectFromResult: (result) => ({
        ...result,
        activities: mapActivitiesFromEvents(result.data?.items || [], network),
      }),
    }
  );

  const tokenQuery = useVestingToken(network, vestingSchedule?.superToken);

  const token = tokenQuery.data;

  const tokenPrice = useTokenPrice(network.id, token?.underlyingAddress);

  const vestingStreamQuery = subgraphApi.useStreamsQuery(
    vestingSchedule
      ? {
          chainId: network.id,
          filter: {
            token: vestingSchedule.superToken.toLowerCase(),
            sender: vestingSchedule.sender.toLowerCase(),
            receiver: vestingSchedule.receiver.toLowerCase(),
            createdAtTimestamp: vestingSchedule.cliffAndFlowExecutedAt,
          },
        }
      : skipToken
  );

  const vestingStream = vestingStreamQuery.data?.data?.[0];

  const onGraphFilterChange = (newGraphFilter: TimeUnitFilterType) =>
    setGraphFilter(newGraphFilter);

  const openStreamDetails = useCallback(() => {
    if (!vestingStream) return;

    router.push(
      getStreamPagePath({
        network: network.slugName,
        stream: vestingStream.id,
      })
    );
  }, [router, network, vestingStream]);

  const cliffAmount = useMemo(() => {
    if (!vestingSchedule) return "0";
    return vestingSchedule.cliffAmount || "0";
  }, [vestingSchedule]);

  const totalVesting = useMemo(() => {
    if (!vestingSchedule) return undefined;
    const { flowRate, endDate, startDate, cliffDate, cliffAmount } =
      vestingSchedule;

    const cliffAndFlowDate = Number(cliffDate || startDate);

    return BigNumber.from(flowRate)
      .mul(Number(endDate) - cliffAndFlowDate)
      .add(cliffAmount || "0")
      .toString();
  }, [vestingSchedule]);

  if (vestingScheduleQuery.isLoading || tokenQuery.isLoading) {
    return <BigLoader />;
  }

  if (!vestingSchedule || !token) return <Page404 />;

  const { symbol } = token;
  const { flowRate, receiver, sender, startDate, endDate } = vestingSchedule;

  const incoming = visibleAddress.toLowerCase() === receiver.toLowerCase();

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
              <Stack direction="row" alignItems="flex-end" columnGap={1}>
                <Typography data-cy={"token-balance"} variant="h3mono">
                  <VestedBalance vestingSchedule={vestingSchedule} />
                </Typography>
                <Typography
                  data-cy={"token-symbol"}
                  variant="h5mono"
                  color="text.secondary"
                  sx={{ lineHeight: "30px" }}
                >
                  {symbol}
                </Typography>
              </Stack>

              {tokenPrice && (
                <Typography
                  data-cy={"token-fiat-balance"}
                  variant="h5mono"
                  color="text.secondary"
                >
                  <FlowingFiatBalance
                    balance={cliffAmount}
                    flowRate={flowRate}
                    balanceTimestamp={Number(
                      vestingSchedule.cliffDate || vestingSchedule.startDate
                    )}
                    price={tokenPrice}
                  />
                </Typography>
              )}
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
                    title="Not Vested"
                    color={theme.palette.text.disabled}
                  />
                </Stack>
              </Stack>
            )}
          </Stack>

          <VestingGraph vestingSchedule={vestingSchedule} />
        </Card>

        <Stack direction="row" alignItems="stretch" gap={3}>
          <VestingDataCard
            title="Tokens Allocated"
            tokenSymbol={token.symbol}
            amount={totalVesting}
            price={tokenPrice}
          />
          <VestingDataCard
            title="Cliff Amount"
            tokenSymbol={token.symbol}
            amount={vestingSchedule.cliffAmount || "0"}
            price={tokenPrice}
          />
        </Stack>

        <Card sx={{ p: 3.5, flex: 1 }}>
          <Stack gap={2}>
            <Typography variant="h5">Schedule</Typography>
            <VestingScheduleProgress vestingSchedule={vestingSchedule} />
          </Stack>
        </Card>

        {vestingStream && (
          <TableContainer
            sx={{
              [theme.breakpoints.down("md")]: {
                mx: -2,
                width: "auto",
                borderRadius: 0,
                border: "none",
                borderBottom: `1px solid ${theme.palette.divider}`,
                boxShadow: "none",
              },
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{incoming ? "From" : "To"}</TableCell>
                  <TableCell>Allocated</TableCell>
                  <TableCell>Vested</TableCell>
                  <TableCell>Vesting Start/End</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow
                  hover
                  onClick={openStreamDetails}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" gap={1.5}>
                      <AddressAvatar
                        address={incoming ? sender : receiver}
                        AvatarProps={{
                          sx: {
                            width: "24px",
                            height: "24px",
                            borderRadius: "5px",
                          },
                        }}
                        BlockiesProps={{ size: 8, scale: 3 }}
                      />
                      <AddressCopyTooltip
                        address={incoming ? sender : receiver}
                      >
                        <Typography data-cy={"receiver-sender"} variant="h7">
                          <AddressName address={incoming ? sender : receiver} />
                        </Typography>
                      </AddressCopyTooltip>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1mono">
                      {totalVesting && <Amount wei={totalVesting} />}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1mono">
                      <VestedBalance vestingSchedule={vestingSchedule} />
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <ListItemText
                      primary={format(
                        fromUnixTime(Number(startDate)),
                        "LLL d, yyyy HH:mm"
                      )}
                      secondary={format(
                        fromUnixTime(Number(endDate)),
                        "LLL d, yyyy HH:mm"
                      )}
                      primaryTypographyProps={{ variant: "body2" }}
                      secondaryTypographyProps={{ color: "text.primary" }}
                    />
                  </TableCell>
                  <TableCell>
                    <VestingStatus vestingSchedule={vestingSchedule} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}

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
