import ShareIcon from "@mui/icons-material/Share";
import {
  Avatar,
  Container,
  Divider,
  ListItemText,
  Paper,
  Stack,
  styled,
  Typography,
} from "@mui/material";
import { format } from "date-fns";
import { BigNumber } from "ethers";
import { NextPage } from "next";
import Error from "next/error";
import { useRouter } from "next/router";
import { FC } from "react";
import Blockies from "react-blockies";
import { useExpectedNetwork } from "../../features/network/ExpectedNetworkContext";
import NetworkIcon from "../../features/network/NetworkIcon";
import { subgraphApi } from "../../features/redux/store";
import { UnitOfTime } from "../../features/send/FlowRateInput";
import EtherFormatted from "../../features/token/EtherFormatted";
import FlowingBalance from "../../features/token/FlowingBalance";
import TokenIcon from "../../features/token/TokenIcon";
import shortenAddress from "../../utils/shortenAddress";

const LoaderSvg = styled("svg")`
  position: relative;

  .rect1 {
    x: 0;
    y: 4;
  }

  .rect2 {
    opacity: 0;
    rx: 0;
  }

  polygon {
    transform: translate(0, 0);
  }

  @keyframes rectIn {
    0% {
      x: 0;
      y: 4;
    }
    25% {
      x: 1;
      y: 3;
    }
    75% {
      x: 1;
      y: 3;
    }
    100% {
      x: 0;
      y: 4;
    }
  }

  @keyframes polyIn {
    0% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(-1px, 1px);
    }
    65% {
      transform: translate(-1px, 1px);
    }
    85% {
      transform: translate(0, 0);
    }
    100% {
      transform: translate(0, 0);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    15% {
      transform: rotate(0deg);
    }
    65% {
      transform: rotate(360deg);
    }
    99% {
      transform: rotate(360deg);
    }
    100% {
      transform: rotate(0);
    }
  }

  &:hover {
    animation: spin 1000ms cubic-bezier(0.55, 0, 0.1, 1);
    animation-iteration-count: infinite;

    .rect1 {
      animation: rectIn 1000ms cubic-bezier(0.6, 0, 0.4, 1);
      animation-iteration-count: infinite;
    }

    polygon {
      animation: polyIn 1000ms cubic-bezier(0.6, 0, 0.4, 1);
      animation-iteration-count: infinite;
    }
  }
`;

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

const Stream: NextPage = () => {
  const router = useRouter();

  const { network } = useExpectedNetwork();
  const streamId = (router.query.stream || "") as string;

  const streamQuery = subgraphApi.useStreamQuery({
    chainId: network.id,
    id: streamId,
  });

  if (streamQuery.isLoading || streamQuery.isFetching) {
    return <Container>Loading</Container>;
  }

  if (!streamQuery.data) {
    return <Error statusCode={404} />;
  }

  const {
    streamedUntilUpdatedAt,
    currentFlowRate,
    updatedAtTimestamp,
    token,
    tokenSymbol,
    receiver,
    sender,
    createdAtTimestamp,
  } = streamQuery.data;

  // TODO: This container max width should be configured in theme. Something between small and medium
  return (
    <Container>
      {/* <LoaderSvg viewBox="0 0 6 6" width="40" height="40">
        <rect className="rect1" x="0" y="4" width="2" height="2" fill="black" />
        <rect className="rect2" x="1" y="1" width="4" height="4" fill="black" />
        <polygon points="2,0 6,0 6,4 4,4 4,2 2,2" fill="black" />
      </LoaderSvg> */}

      <Stack
        alignItems="center"
        gap={3}
        sx={{ maxWidth: "760px", margin: "0 auto" }}
      >
        <Typography variant="h5" color="error">
          Cancelled by sender on 10 August 2022 at 11:30 PM GMT
        </Typography>

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
            $2241.30486 USD
          </Typography>
        </Stack>

        <Stack
          direction="row"
          alignItems="end"
          justifyContent="stretch"
          sx={{ width: "100%" }}
        >
          <Stack flex={1} gap={2}>
            <Typography variant="h6" sx={{ pl: 1 }}>
              Sender
            </Typography>
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

          <img src="/gifs/stream-loop.gif" alt="Stream loop" width="92px" />

          <Stack flex={1} gap={2}>
            <Typography variant="h6" sx={{ pl: 1 }}>
              Receiver
            </Typography>
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

        <Stack
          rowGap={0.5}
          columnGap={6}
          sx={{
            maxWidth: "680px",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            mt: 7,
          }}
        >
          <OverviewItem
            label="Start Date:"
            value={format(createdAtTimestamp * 1000, "d MMM. yyyy h:mm aaa")}
          />
          <OverviewItem label="Buffer:" value="80.54992 USDCx" />
          <OverviewItem label="End Date:" value="14 August 2022 " />
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
            value="14 August 2022 "
          />
          <OverviewItem
            label="Transaction ID:"
            value={shortenAddress(streamId, 6)}
          />
        </Stack>

        <Divider sx={{ maxWidth: "375px", width: "100%", my: 1 }} />

        <Stack direction="row" alignItems="center" gap={1}>
          <ShareIcon />
          <Typography variant="h5">Share:</Typography>
        </Stack>
      </Stack>
    </Container>
  );
};

export default Stream;
