import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Button, Container, Typography } from "@mui/material";
import { NextPage } from "next";
import NextLink from "next/link";
import withStaticSEO from "../components/SEO/withStaticSEO";
import Link from "../features/common/Link";

const HELP_CENTER_URL = "https://help.superfluid.finance/";

const Page404: NextPage = () => {
  return (
    <Container maxWidth="lg" sx={{ textAlign: "center", mt: "20vh" }}>
      <Typography variant="h1" color="primary">
        Oops!
      </Typography>
      <Typography variant="h1" sx={{ mb: 2 }}>
        Something went wrong.
      </Typography>
      <Typography data-cy={"404-message"} variant="h4">
        Error{" "}
        <Typography variant="h4" color="primary" component="span">
          404
        </Typography>{" "}
        Page Not Found
      </Typography>

      <Button
        LinkComponent={Link}
        data-cy={"return-to-dashboard-button"}
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

      <Typography variant="h5">
        Need support? Visit our{" "}
        <NextLink
          href={HELP_CENTER_URL}
          passHref
          target="_blank"
          legacyBehavior
        >
          <Typography
            data-cy={"help-center-link"}
            color="primary"
            variant="h5"
            component="a"
            target="_blank"
            href={HELP_CENTER_URL}
            sx={{ textDecoration: "none" }}
          >
            Help Center
          </Typography>
        </NextLink>
      </Typography>
    </Container>
  );
};

export default withStaticSEO({ title: "Not Found | Superfluid" }, Page404);
