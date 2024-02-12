import {
  Box,
  Card,
  Container,
  Stack,
  useTheme,
} from "@mui/material";
import { PropsWithChildren, memo } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import NetworkBadge from "../network/NetworkBadge";
import { useRouter } from "next/router";
import { CardTabButton } from "../../components/CardTabButton/CardTabButton";
import Link from "../common/Link";

export default memo(function SendPageLayout({ children }: { children: PropsWithChildren["children"] }) {
  const theme = useTheme();
  const { network } = useExpectedNetwork();

  const router = useRouter();
  const isActiveRoute = (...routes: Array<string>) =>
    routes.includes(router.route);

  return (
    <Container key={`${network.slugName}`} maxWidth="lg">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          [theme.breakpoints.up("md")]: {
            my: 4,
          },
        }}
      >
        <Card
          data-cy={"send-card"}
          elevation={1}
          sx={{
            maxWidth: "600px",
            width: "100%",
            position: "relative",
            [theme.breakpoints.down("md")]: {
              boxShadow: "none",
              backgroundImage: "none",
              borderRadius: 0,
              border: 0,
              p: 0,
            },
          }}
        >

          <Stack direction="row" spacing={2} sx={{ mb: 4 }} >
            <CardTabButton dataCy="send-or-modify-stream" isActive={isActiveRoute("/send")} href={"/send"} LinkComponent={Link}>Stream</CardTabButton>
            <CardTabButton dataCy="transfer" isActive={isActiveRoute("/transfer")} href={"/transfer"} LinkComponent={Link}>Transfer</CardTabButton>
          </Stack>

          <NetworkBadge
            network={network}
            sx={{ position: "absolute", top: 0, right: theme.spacing(3.5) }}
            NetworkIconProps={{
              size: 32,
              fontSize: 18,
              sx: { [theme.breakpoints.down("md")]: { borderRadius: 1 } },
            }}
          />
          {children}
        </Card>
      </Box>
    </Container>
  );
});
