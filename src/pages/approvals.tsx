import {
  Container,
  Stack,
} from "@mui/material";
import { NextPage } from "next";
import withStaticSEO from "../components/SEO/withStaticSEO";
import { useAccount } from "@/hooks/useAccount"
import NoWalletConnected from "../components/NoWalletConnected/NoWalletConnected";
import { TokenAccessTables } from "../features/tokenAccess/TokenAccessTables";
import { useVisibleAddress } from "../features/wallet/VisibleAddressContext";


const ApprovalsPage: NextPage = () => {
  const { address } = useAccount();
  const { visibleAddress } = useVisibleAddress();

  return (
    <Container maxWidth="lg" key={visibleAddress}>
      {!address ? (
        <NoWalletConnected />
      ) : (
        <Stack direction="column" gap={"30px"}>
          {visibleAddress && <TokenAccessTables key={visibleAddress} />}
        </Stack>
      )}
    </Container>
  );
};

export default withStaticSEO({ title: "Approvals | Superfluid" }, ApprovalsPage);
