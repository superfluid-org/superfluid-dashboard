import { Box, Container, useTheme } from "@mui/material";
import { NextPage } from "next";
import SendCard from "../features/send/SendCard";
import StreamingFormProvider from "../features/send/StreamingFormProvider";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import {
  RestorationType,
  SendStreamRestoration,
  ModifyStreamRestoration,
} from "../features/transactionRestoration/transactionRestorations";

const Send: NextPage = () => {
  const theme = useTheme();
  const { restoration, onRestored } = useTransactionRestorationContext();

  let streamingRestoration:
    | SendStreamRestoration
    | ModifyStreamRestoration
    | undefined;

  if (restoration) {
    switch (restoration.type) {
      case RestorationType.SendStream:
        streamingRestoration = restoration as SendStreamRestoration;
        break;
      case RestorationType.ModifyStream:
        streamingRestoration = restoration as ModifyStreamRestoration;
        break;
    }
    onRestored();
  }

  return (
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
        <StreamingFormProvider restoration={streamingRestoration}>
          <SendCard />
        </StreamingFormProvider>
      </Box>
    </Container>
  );
};

export default Send;
