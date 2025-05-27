import { Container, Stack, Typography, useTheme } from "@mui/material";
import { NextPage } from "next";
import withStaticSEO from "../components/SEO/withStaticSEO";
import Link from "../features/common/Link";
import { LiFiWidgetManager } from "../features/bridge/LiFiWidgetManager";


const Bridge: NextPage = () => {
  return (
    <Container
      data-cy={"lifi-widget"}
      maxWidth="lg"
    >
      <LiFiWidgetManager />
      <Stack pt={6} alignItems="center">
        <Typography
          sx={{
            maxWidth: 524,
            textAlign: "inherit",
          }}
          variant="h7"
          component="p"
          color="secondary"
          textAlign="center"
        >
          The Bridge is operated by LI.FI, and we cannot take responsibility for
          any issues. For support related to the bridge, please refer to the
          LI.FI{" "}
          <Link href="https://discord.com/invite/lifi" target="_blank">
            Discord server
          </Link>.
        </Typography>
      </Stack>
    </Container>
  );
};

export default withStaticSEO({ title: "Bridge | Superfluid" }, Bridge);