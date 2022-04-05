import { Box, Container } from "@mui/material";
import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { TokenPanel } from "../components/TokenWrapping/TokenPanel";
import { useTransactionContext } from "../components/TransactionDrawer/TransactionContext";
import { useNetworkContext } from "../contexts/NetworkContext";
import { SuperTokenUpgradeRecovery } from "../redux/transactionRecoverySlice";

const Upgrade: NextPage = () => {
  const { network, setNetwork } = useNetworkContext();
  const { transactionRecovery, setTransactionRecovery } =
    useTransactionContext();

  const [
    transactionRecoveryNetworkScoped,
    setTransactionRecoveryNetworkScoped,
  ] = useState<SuperTokenUpgradeRecovery | undefined>();

  useEffect(() => {
    if (
      transactionRecovery &&
      transactionRecovery.transactionInfo.chainId !== network.chainId
    ) {
      setNetwork(transactionRecovery.transactionInfo.chainId);
    }
  }, []);

  useEffect(() => {
    if (transactionRecovery?.transactionInfo.chainId === network.chainId) {
      setTransactionRecoveryNetworkScoped(
        transactionRecovery as SuperTokenUpgradeRecovery
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
          tabValue="upgrade"
        ></TokenPanel>
      </Box>
    </Container>
  );
};

export default Upgrade;
