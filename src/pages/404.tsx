import { Button, Container, Typography } from "@mui/material";
import { NextPage } from "next";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Link from "next/link";
import SEO from "../components/SEO/SEO";

const HELP_CENTER_URL = "https://help.superfluid.finance/";

const Page404: NextPage = () => {
  return (
    <SEO title="404 | Superfluid">
      <Container maxWidth="lg" sx={{ textAlign: "center", mt: "20vh" }}>
        <Typography variant="h1" color="primary">
          Oops!
        </Typography>
        <Typography variant="h1" sx={{ mb: 2 }}>
          Something went wrong.
        </Typography>
        <Typography variant="h4">
          Error{" "}
          <Typography variant="h4" color="primary" component="span">
            404
          </Typography>{" "}
          Page Not Found
        </Typography>

        <Link href="/" passHref>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component="a"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ my: 4.5 }}
            href="/"
          >
            Return to Dashboard
          </Button>
        </Link>

        <Typography variant="h5">
          Need support? Visit our{" "}
          <Link href={HELP_CENTER_URL} passHref target="_blank">
            <Typography
              color="primary"
              variant="h5"
              component="a"
              target="_blank"
              href={HELP_CENTER_URL}
              sx={{ textDecoration: "none" }}
            >
              Help Center
            </Typography>
          </Link>
        </Typography>
      </Container>
    </SEO>
  );
};

export default Page404;
