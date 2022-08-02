import { Box, Container, useTheme } from "@mui/material";
import { formatEther } from "ethers/lib/utils";
import { NextPage } from "next";
import SEO from "../components/SEO/SEO";
import SendCard from "../features/send/SendCard";
import StreamingFormProvider, {
  StreamingFormProviderProps,
} from "../features/send/StreamingFormProvider";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import { RestorationType } from "../features/transactionRestoration/transactionRestorations";

const Send: NextPage = () => {
  const theme = useTheme();
  const { restoration, onRestored } = useTransactionRestorationContext();

  let initialFormValues: StreamingFormProviderProps["initialFormValues"] = {};
  if (restoration) {
    switch (restoration.type) {
      case RestorationType.SendStream:
      case RestorationType.ModifyStream:
        initialFormValues = {
          flowRate: {
            amountEther: formatEther(restoration.flowRate.amountWei),
            unitOfTime: restoration.flowRate.unitOfTime,
          },
          receiverAddress: restoration.receiverAddress,
          tokenAddress: restoration.tokenAddress,
        };
        break;
    }
    onRestored();
  }

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
          <StreamingFormProvider initialFormValues={initialFormValues}>
            <SendCard />
          </StreamingFormProvider>
        </Box>
      </Container>
    </SEO>
  );
};

export default Send;
