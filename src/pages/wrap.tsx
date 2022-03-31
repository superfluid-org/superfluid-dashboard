import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import { TokenPanel } from '../components/TokenDialog';
import { useRouter } from 'next/router';

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
