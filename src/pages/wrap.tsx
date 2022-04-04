import { Box, Container } from '@mui/material';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {TokenPanel} from "../components/TokenWrapping/TokenPanel";

const Wrap: NextPage = () => {
  const router = useRouter();
  const { transactionRecoveryId } = router.query;

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <TokenPanel transactionRecoveryId={transactionRecoveryId as string | undefined}></TokenPanel>
      </Box>
    </Container>
  );
};

export default Wrap;
