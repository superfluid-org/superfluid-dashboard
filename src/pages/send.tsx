import { Box, Container } from "@mui/material";
import { NextPage } from "next";
import SendCard from "../features/send/SendCard";
import { useTransactionRestorationContext } from "../features/transactionRestoration/TransactionRestorationContext";
import { RestorationType, SendStreamRestoration } from "../features/transactionRestoration/transactionRestorations";

const Send: NextPage = () => {
  const { restoration, onRestored } = useTransactionRestorationContext();

  let sendStreamRestoration: SendStreamRestoration | undefined;

  if (restoration) {
    switch (restoration.type) {
      case RestorationType.SendStream:
        sendStreamRestoration = restoration as SendStreamRestoration;
        break;
    }
    onRestored();
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <SendCard restoration={sendStreamRestoration} />
      </Box>
    </Container>
  );
};

export default Send;
