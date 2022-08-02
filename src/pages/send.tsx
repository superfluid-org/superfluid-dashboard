import { Box, Container, useTheme } from "@mui/material";
import { formatEther } from "ethers/lib/utils";
import { isString } from "lodash";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import SEO from "../components/SEO/SEO";
import SendCard from "../features/send/SendCard";
import StreamingFormProvider, {
  StreamingFormProviderProps,
} from "../features/send/StreamingFormProvider";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import { RestorationType } from "../features/transactionRestoration/transactionRestorations";

const Send: NextPage = () => {
  const theme = useTheme();
  const router = useRouter();
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
            });
            break;
          default:
            setInitialFormValues({});
        }
        onRestored();
      } else {
        const { token: maybeTokenAddress, receiver: maybeReceiverAddress } =
          router.query;
        setInitialFormValues({
          tokenAddress:
            maybeTokenAddress && isString(maybeTokenAddress)
              ? maybeTokenAddress
              : undefined,
          receiverAddress:
            maybeReceiverAddress && isString(maybeReceiverAddress)
              ? maybeReceiverAddress
              : undefined,
        });
      }
    }
  }, [router.isReady]);

  return (
    <SEO title="Send Stream | Superfluid">
      <Container maxWidth="lg">
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
    </SEO>
  );
};

export default Send;
