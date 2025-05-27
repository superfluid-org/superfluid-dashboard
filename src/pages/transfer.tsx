import { useTheme } from "@mui/material";
import { formatEther } from "ethers/lib/utils";
import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import { parseEtherOrZero } from "../utils/tokenUtils";
import { buildQueryString } from "../utils/URLUtils";
import TransferFormProvider, { TransferFormProviderProps } from "../features/send/transfer/TransferFormProvider";
import SendTransfer from "../features/send/transfer/SendTransfer";
import { RestorationType } from "../features/transactionRestoration/transactionRestorations";
import SendPageLayout from "../features/send/SendPageLayout";


interface TransferPageQuery {
  token?: string;
  receiver?: string;
  network?: string;
  amountEther?: string;
}

export const getTransferPagePath = (query: TransferPageQuery) => {
  const { amountEther, ...rest } = query;

  const queryString = buildQueryString({
    ...rest,
    "amount": amountEther,
  });

  return `/transfer${queryString ? `?${queryString}` : ""}`;
};

const Transfer: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
  const { network } = useExpectedNetwork();
  const { restoration, onRestored } = useTransactionRestorationContext();
  const [initialFormValues, setInitialFormValues] = useState<
    TransferFormProviderProps["initialFormValues"] | undefined
  >();

  useEffect(() => {
    if (router.isReady) {
      if (restoration) {
        switch (restoration.type) {
          case RestorationType.SendTransfer:
            setInitialFormValues({
              receiverAddress: restoration.receiverAddress,
              tokenAddress: restoration.tokenAddress,
              amountEther: restoration.amountEther,
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
          "amount": maybeAmountEther,
          ...remainingQuery
        } = router.query;

        const amountWei = parseEtherOrZero(isString(maybeAmountEther) ? maybeAmountEther : "0");
        const amountEther = amountWei.isZero() ? "" : formatEther(amountWei);

        setInitialFormValues({
          amountEther: amountEther,
          tokenAddress:
            maybeTokenAddress && isString(maybeTokenAddress)
              ? maybeTokenAddress
              : undefined,
          receiverAddress:
            maybeReceiverAddress && isString(maybeReceiverAddress)
              ? maybeReceiverAddress
              : undefined
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
        <TransferFormProvider initialFormValues={initialFormValues}>
          <SendTransfer />
        </TransferFormProvider>
      )}
    </SendPageLayout>
  );
};

export default withStaticSEO({ title: "Transfer | Superfluid" }, Transfer);