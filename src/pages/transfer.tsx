import { Box, Container, useTheme } from "@mui/material";
import { formatEther } from "ethers/lib/utils";
import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useExpectedNetwork } from "../features/network/ExpectedNetworkContext";
import SendCardContainer from "../features/send/SendCardContainer";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import { parseEtherOrZero } from "../utils/tokenUtils";
import { buildQueryString } from "../utils/URLUtils";
import TransferFormProvider, { TransferFormProviderProps } from "../features/send/TransferFormProvider";
import SendTransfer from "../features/send/SendTransfer";

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

        const amountEther = formatEther(parseEtherOrZero(isString(maybeAmountEther) ? maybeAmountEther : "0"));

        setInitialFormValues({
          amountEther,
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
        <SendCardContainer>
          {initialFormValues && (
            <TransferFormProvider initialFormValues={initialFormValues}>
              <SendTransfer />
            </TransferFormProvider>
          )}
        </SendCardContainer>
      </Box>
    </Container>
  );
};

export default withStaticSEO({ title: "Transfer | Superfluid" }, Transfer);
