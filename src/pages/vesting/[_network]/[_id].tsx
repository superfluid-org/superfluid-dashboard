import {
  Box,
  Card,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Chip from "@mui/material/Chip";
import { fromUnixTime, getUnixTime } from "date-fns";
import { BigNumber, BigNumberish } from "ethers";
import { isString } from "lodash";
import { useRouter } from "next/router";
import { FC, ReactElement, useEffect, useMemo, useState } from "react";
import TimeUnitFilter, {
  TimeUnitFilterType,
} from "../../../features/graph/TimeUnitFilter";
import NetworkIcon from "../../../features/network/NetworkIcon";
import { Network, networksBySlug } from "../../../features/network/networks";
import Amount from "../../../features/token/Amount";
import FlowingBalance from "../../../features/token/FlowingBalance";
import TokenIcon from "../../../features/token/TokenIcon";
import FiatAmount from "../../../features/tokenPrice/FiatAmount";
import FlowingFiatBalance from "../../../features/tokenPrice/FlowingFiatBalance";
import useTokenPrice from "../../../features/tokenPrice/useTokenPrice";
import { BigLoader } from "../../../features/vesting/BigLoader";
import { useVestingToken } from "../../../features/vesting/useVestingToken";
import VestedBalance from "../../../features/vesting/VestedBalance";
import VestingGraph from "../../../features/vesting/VestingGraph";
import VestingHeader from "../../../features/vesting/VestingHeader";
import { VestingLayout } from "../../../features/vesting/VestingLayout";
import VestingScheduleProgress from "../../../features/vesting/VestingScheduleProgress";
import useNavigateBack from "../../../hooks/useNavigateBack";
import { useGetVestingScheduleQuery } from "../../../vesting-subgraph/getVestingSchedule.generated";
import Page404 from "../../404";
import { NextPageWithLayout } from "../../_app";

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

const VestingScheduleDetailsPage: NextPageWithLayout = () => {
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
  const navigateBack = useNavigateBack("/vesting");
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const [graphFilter, setGraphFilter] = useState(TimeUnitFilterType.All);

  const vestingScheduleQuery = useGetVestingScheduleQuery({
    id,
  });
  const vestingSchedule = vestingScheduleQuery.data?.vestingSchedule;

  const tokenQuery = useVestingToken(
    network,
    vestingScheduleQuery?.data?.vestingSchedule?.superToken
  );
  const token = tokenQuery.data;

  const tokenPrice = useTokenPrice(network.id, token?.underlyingAddress);

  const onGraphFilterChange = (newGraphFilter: TimeUnitFilterType) =>
    setGraphFilter(newGraphFilter);

  const isVesting = useMemo(() => {
    const dateNow = new Date();

    return (
      vestingSchedule &&
      (!vestingSchedule.cliffDate ||
        fromUnixTime(Number(vestingSchedule.cliffDate)) <= dateNow) &&
      fromUnixTime(Number(vestingSchedule.endDate)) >= dateNow
    );
  }, [vestingSchedule]);

  const cliffAmount = useMemo(() => {
    if (!vestingSchedule) return "0";
    return vestingSchedule.cliffAmount || "0";
  }, [vestingSchedule]);

  const currentlyVested: BigNumberish = useMemo(() => {
    if (!vestingSchedule) return "0";
    const { flowRate, endDate, cliffDate, startDate } = vestingSchedule;

    const currentUnix = getUnixTime(new Date());
    const endDateUnix = Number(endDate);
    const startDateUnix = Number(cliffDate || startDate);
    const receivedCliff =
      cliffDate && startDateUnix <= currentUnix ? cliffAmount : "0";

    const vested = BigNumber.from(flowRate)
      .mul(Math.min(endDateUnix, currentUnix) - startDateUnix)
      .add(receivedCliff);

    return vested.gt("0") ? vested : "0";
  }, [vestingSchedule, cliffAmount]);

  const totalVesting = useMemo(() => {
    if (!vestingSchedule) return undefined;
    const { flowRate, endDate, startDate, cliffDate, cliffAmount } =
      vestingSchedule;
    console.log({ cliffDate, startDate });
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
  const { flowRate } = vestingSchedule;

  return (
    <Container maxWidth="lg">
      <VestingHeader onBack={navigateBack}>
        <Stack direction="row" alignItems="center" gap={2}>
          <TokenIcon isSuper tokenSymbol={symbol} />
          <Typography component="h1" variant="h4">
            Vesting {symbol}
          </Typography>
          <Chip
            size="small"
            label={network.name}
            translate="no"
            avatar={<NetworkIcon network={network} size={18} fontSize={14} />}
          />
        </Stack>
      </VestingHeader>

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
            title="Tokens granted"
            tokenSymbol={token.symbol}
            amount={totalVesting}
            price={tokenPrice}
          />
          <VestingDataCard
            title="Cliff amount"
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
      </Stack>
    </Container>
  );
};

VestingScheduleDetailsPage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default VestingScheduleDetailsPage;
