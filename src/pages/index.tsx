import type { NextPage } from 'next';
import { Box, Container } from '@mui/material';

const Home: NextPage = () => {
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
        Hello world!
      </Box>
    </Container>
  );
};

export default Home;