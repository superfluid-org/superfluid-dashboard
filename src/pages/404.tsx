import { Button, Container, Typography } from "@mui/material";
import { NextPage } from "next";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";

const Page404: NextPage = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h1" color="primary">
        Oops!
      </Typography>
      <Typography variant="h1">Something went wrong.</Typography>
      <Typography variant="h4">
        Error
        <Typography variant="h4" color="primary" component="span">
          404
        </Typography>{" "}
        Page Not Found
      </Typography>

      <Button
        variant="contained"
        color="primary"
        startIcon={<ArrowBackRoundedIcon />}
      >
        Return to Dashboard
      </Button>

      <Typography variant="h5">
        Need support? Visit our{" "}
        <Typography color="primary" variant="h5" component="span">
          Help Center
        </Typography>
      </Typography>
    </Container>
  );
};

export default Page404;
