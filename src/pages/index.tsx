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
        <TokenSnapshotTables
          address={"0x3be39EA586E565683e0C57d1243Aa950Ba466c89".toLowerCase()}
        />
      ) : (
        <div>Wallet selection page</div>
      )}
    </Container>
  );
};

export default Home;
