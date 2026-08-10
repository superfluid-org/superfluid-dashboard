import { Container, Stack, Typography, useTheme } from "@mui/material";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import withStaticSEO from "../components/SEO/withStaticSEO";
import Link from "../features/common/Link";

// Client-only: @lifi/widget v4 bundles MUI v9, whose ESM build Node cannot
// import when externalized during SSR/page-data collection.
const LiFiWidgetManager = dynamic(
  () =>
    import("../features/bridge/LiFiWidgetManager").then(
      (mod) => mod.LiFiWidgetManager
    ),
  { ssr: false }
);


const Bridge: NextPage = () => {
  return (
    <Container
      data-cy={"lifi-widget"}
      maxWidth="lg"
    >
      <LiFiWidgetManager />
      <Stack
        sx={{
          pt: 6,
          alignItems: "center"
        }}>
        <Typography
          variant="h7"
          component="p"
          color="secondary"
          sx={{
            maxWidth: 524,
            textAlign: "inherit",
          }}
        >
          Swapping and bridging are powered by LI.FI, and we cannot take
          responsibility for any issues. For support, please refer to the
          LI.FI{" "}
          <Link href="https://discord.com/invite/lifi" target="_blank">
            Discord server
          </Link>.
        </Typography>
      </Stack>
    </Container>
  );
};

export default withStaticSEO({ title: "Swap & Bridge | Superfluid" }, Bridge);