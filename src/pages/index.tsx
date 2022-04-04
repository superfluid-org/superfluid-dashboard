import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';

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
