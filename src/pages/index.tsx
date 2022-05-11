import { Container } from "@mui/material";
import type { NextPage } from "next";
import TokenSnapshotEmptyCard from "../features/tokenSnapshotTable/TokenSnapshotEmptyCard";
import TokenSnapshotTables from "../features/tokenSnapshotTable/TokenSnapshotTables";
import { useWalletContext } from "../features/wallet/WalletContext";

const Home: NextPage = () => {
  const { walletAddress } = useWalletContext();

  return (
    <Container maxWidth="lg">
      {walletAddress ? (
        <TokenSnapshotTables address={walletAddress} />
      ) : (
        <div>Wallet selection page</div>
      )}
    </Container>
  );
};

export default Home;
