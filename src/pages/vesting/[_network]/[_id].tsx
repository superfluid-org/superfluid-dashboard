import {
  Card,
  Container,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { fromUnixTime, getUnixTime } from "date-fns";
import { BigNumber } from "ethers";
import { isString } from "lodash";
import { useRouter } from "next/router";
import { FC, ReactElement, useEffect, useMemo, useState } from "react";
import TimeUnitFilter, {
  TimeUnitFilterType,
} from "../../../features/graph/TimeUnitFilter";
import { Network, networksBySlug } from "../../../features/network/networks";
import Amount from "../../../features/token/Amount";
import FlowingBalance from "../../../features/token/FlowingBalance";
import TokenIcon from "../../../features/token/TokenIcon";
import FiatAmount from "../../../features/tokenPrice/FiatAmount";
import useTokenPrice from "../../../features/tokenPrice/useTokenPrice";
import { BigLoader } from "../../../features/vesting/BigLoader";
import { useVestingToken } from "../../../features/vesting/useVestingToken";
import VestingHeader from "../../../features/vesting/VestingHeader";
import { VestingLayout } from "../../../features/vesting/VestingLayout";
import useNavigateBack from "../../../hooks/useNavigateBack";
import { getTimeInSeconds } from "../../../utils/dateUtils";
import { useGetVestingScheduleQuery } from "../../../vesting-subgraph/getVestingSchedule.generated";
import Page404 from "../../404";
import { NextPageWithLayout } from "../../_app";

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
  <Card sx={{ p: 3.5 }}>
    <Typography variant="h5">{title}</Typography>
    <Stack direction="row" alignItems="center">
      <TokenIcon isSuper tokenSymbol={tokenSymbol} />
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

  const isVesting = useMemo(
    () =>
      vestingSchedule &&
      (!vestingSchedule.cliffDate ||
        fromUnixTime(Number(vestingSchedule.cliffDate))) >= new Date(),
    [vestingSchedule]
  );

  const balance = useMemo(
    () =>
      isVesting && vestingSchedule?.cliffAmount
        ? vestingSchedule.cliffAmount
        : "0",
    [vestingSchedule, isVesting]
  );

  const totalVesting = useMemo(() => {
    if (!vestingSchedule) return undefined;
    const { flowRate, endDate, startDate, cliffDate } = vestingSchedule;

    const cliffAndFlowDate = Number(cliffDate ? startDate : cliffDate);

    return BigNumber.from(flowRate)
      .mul(Number(endDate) - cliffAndFlowDate)
      .toString();
  }, [vestingSchedule]);

  if (vestingScheduleQuery.isLoading || tokenQuery.isLoading) {
    return <BigLoader />;
  }

  if (!vestingSchedule || !token) return <Page404 />;

  const { symbol } = token;

  const { cliffDate, cliffAmount, endDate, flowRate, startDate } =
    vestingSchedule;

  return (
    <Container maxWidth="lg">
      <VestingHeader onBack={navigateBack}>
        <>
          <TokenIcon isSuper tokenSymbol="USDCx" />
          <Typography component="h1" variant="h4">
            Vesting
          </Typography>
        </>
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
                  <FlowingBalance
                    balance={balance}
                    flowRate={flowRate}
                    balanceTimestamp={Number(
                      vestingSchedule.cliffDate || vestingSchedule.startDate
                    )}
                    disableRoundingIndicator
                  />
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

              {/* {tokenPrice && (
                <Typography
                  data-cy={"token-fiat-balance"}
                  variant="h5mono"
                  color="text.secondary"
                >
                  <FlowingFiatBalance
                    balance={balance}
                    flowRate={flowRate}
                    balanceTimestamp={balanceTimestamp}
                    price={tokenPrice}
                  />
                </Typography>
              )} */}
            </Stack>

            {!isBelowMd && (
              <TimeUnitFilter
                activeFilter={graphFilter}
                onChange={onGraphFilterChange}
              />
            )}
          </Stack>
        </Card>

        <Stack direction="row" gap={3}>
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
      </Stack>
    </Container>
  );
};

VestingScheduleDetailsPage.getLayout = function getLayout(page: ReactElement) {
  return <VestingLayout>{page}</VestingLayout>;
};

export default VestingScheduleDetailsPage;
