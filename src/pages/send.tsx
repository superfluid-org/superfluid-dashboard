import { Box, Container, useTheme } from "@mui/material";
import { formatEther } from "ethers/lib/utils";
import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useAnalytics } from "../features/analytics/useAnalytics";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import {
  timeUnitWordMap,
  UnitOfTime,
  wordTimeUnitMap,
} from "../features/send/FlowRateInput";
import SendCard from "../features/send/SendCard";
import StreamingFormProvider, {
  StreamingFormProviderProps,
} from "../features/send/StreamingFormProvider";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import { RestorationType } from "../features/transactionRestoration/transactionRestorations";
import { tryParseUnits } from "../utils/tokenUtils";
import { buildQueryString } from "../utils/URLUtils";

interface SendPageQuery {
  token?: string;
  receiver?: string;
  flowRate?: { amountEther: string; unitOfTime: UnitOfTime };
  network?: string;
}

export const getSendPagePath = (query: SendPageQuery) => {
  const { flowRate, ...rest } = query;

  const serializedFlowRate = flowRate
    ? `${flowRate.amountEther}/${timeUnitWordMap[flowRate.unitOfTime]}`
    : undefined;

  const queryString = buildQueryString({
    ...rest,
    "flow-rate": serializedFlowRate,
  });

  return `/send${queryString ? `?${queryString}` : ""}`;
};

const tryParseFlowRate = (
  value: string
):
  | {
      amountEther: string;
      unitOfTime: UnitOfTime;
    }
  | undefined => {
  const [amountEther, unitOfTime] = value.split("/");

  const isUnitOfTime = Object.keys(wordTimeUnitMap).includes(
    (unitOfTime ?? "").toLowerCase()
  );
  const isEtherAmount = !!tryParseUnits(amountEther);

  if (isUnitOfTime && isEtherAmount) {
    return {
      amountEther,
      unitOfTime: wordTimeUnitMap[unitOfTime],
    };
  } else {
    return undefined;
  }
};

const Send: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { network } = useExpectedNetwork();
  const { restoration, onRestored } = useTransactionRestorationContext();
  const [initialFormValues, setInitialFormValues] = useState<
    StreamingFormProviderProps["initialFormValues"] | undefined
  >();

  useEffect(() => {
    if (router.isReady) {
      if (restoration) {
        switch (restoration.type) {
          case RestorationType.SendStream:
          case RestorationType.ModifyStream:
            setInitialFormValues({
              flowRate: {
                amountEther: formatEther(restoration.flowRate.amountWei),
                unitOfTime: restoration.flowRate.unitOfTime,
              },
              receiverAddress: restoration.receiverAddress,
              tokenAddress: restoration.tokenAddress,
              endTimestamp: restoration.endTimestamp,
            });
            break;
          default:
            setInitialFormValues({});
        }
        onRestored();
      } else {
        const {
          token: maybeTokenAddress,
          receiver: maybeReceiverAddress,
          "flow-rate": maybeFlowRate,
          "end-date": maybeEndTimestamp,
          ...remainingQuery
        } = router.query;

        const flowRate = !!(maybeFlowRate && isString(maybeFlowRate))
          ? tryParseFlowRate(maybeFlowRate)
          : undefined;

        setInitialFormValues({
          flowRate,
          tokenAddress:
            maybeTokenAddress && isString(maybeTokenAddress)
              ? maybeTokenAddress
              : undefined,
          receiverAddress:
            maybeReceiverAddress && isString(maybeReceiverAddress)
              ? maybeReceiverAddress
              : undefined,
          endTimestamp:
            maybeEndTimestamp && isString(maybeEndTimestamp)
              ? Number(maybeEndTimestamp)
              : undefined,
        });

        router.replace(
          {
            query: remainingQuery,
          },
          undefined,
          {
            shallow: true,
          }
        );
      }
    }
  }, [router.isReady]);

  return (
    <Container key={`${network.slugName}`} maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          [theme.breakpoints.up("md")]: {
            my: 4,
          },
        }}
      >
        {initialFormValues && (
          <StreamingFormProvider initialFormValues={initialFormValues}>
            <SendCard />
          </StreamingFormProvider>
        )}
      </Box>
    </Container>
  );
};

export default withStaticSEO({ title: "Send Stream | Superfluid" }, Send);
