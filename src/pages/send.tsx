import { formatEther } from "ethers/lib/utils";
import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import {
  timeUnitWordMap,
  UnitOfTime,
  wordTimeUnitMap,
} from "../features/send/FlowRateInput";
import StreamingFormProvider, {
  StreamingFormProviderProps,
} from "../features/send/stream/StreamingFormProvider";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import { RestorationType } from "../features/transactionRestoration/transactionRestorations";
import { tryParseUnits } from "../utils/tokenUtils";
import { buildQueryString } from "../utils/URLUtils";
import SendStream from "../features/send/stream/SendStream";
import SendPageLayout from "../features/send/SendPageLayout";

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
    <SendPageLayout key={`${network.slugName}`}>
      {initialFormValues && (
        <StreamingFormProvider initialFormValues={initialFormValues}>
          <SendStream />
        </StreamingFormProvider>
      )}
    </SendPageLayout>
  );
};

export default withStaticSEO({ title: "Send Stream | Superfluid" }, Send);
