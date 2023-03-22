import { Typography, Box, Container, Stack, Divider } from "@mui/material";
import { NextPage } from "next";
import NotificationSettings from "../components/NotificationSettings/NotificationSettings";
import withStaticSEO from "../components/SEO/withStaticSEO";

const SettingsPage: NextPage = () => {
  return (
    <Container maxWidth="lg">
      <Typography component="h1" variant="h4" mb="16px" ml="4px">
        Settings
      </Typography>
      <NotificationSettings />
    </Container>
  );
};

export default withStaticSEO({ title: "Settings | Superfluid" }, SettingsPage);
