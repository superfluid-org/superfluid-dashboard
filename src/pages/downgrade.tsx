import { Box, Container } from "@mui/material";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { TokenPanel } from "../components/TokenWrapping/TokenPanel";
import { useTransactionContext } from "../components/TransactionDrawer/TransactionContext";
import { useNetworkContext } from "../contexts/NetworkContext";
import { SuperTokenDowngradeRecovery } from "../redux/transactionRecoverySlice";

const Downgrade: NextPage = () => {
  const { network, setNetwork } = useNetworkContext();
  const { transactionRecovery, setTransactionRecovery } =
    useTransactionContext();

  const [
    transactionRecoveryNetworkScoped,
    setTransactionRecoveryNetworkScoped,
  ] = useState<SuperTokenDowngradeRecovery | undefined>();

  useEffect(() => {
    if (
      transactionRecovery &&
      transactionRecovery.transactionInfo.chainId !== network.chainId
    ) {
      setNetwork(transactionRecovery.transactionInfo.chainId);
    }
  }, [network]);

  useEffect(() => {
    if (transactionRecovery?.transactionInfo.chainId === network.chainId) {
      setTransactionRecoveryNetworkScoped(
        transactionRecovery as SuperTokenDowngradeRecovery
      );
      setTransactionRecovery(undefined);
    }
  }, []);

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
        <TokenPanel
          transactionRecovery={transactionRecoveryNetworkScoped}
          tabValue="downgrade"
        ></TokenPanel>
      </Box>
    </Container>
  );
};

export default Downgrade;
