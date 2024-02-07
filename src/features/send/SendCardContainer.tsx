import {
  Button,
  Card,
  Stack,
  useTheme,
} from "@mui/material";
import { FC, PropsWithChildren, memo } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import NetworkBadge from "../network/NetworkBadge";
import { useRouter } from "next/router";

const TabButton: FC<{
  text: string;
  isActive: boolean;
  dataCy: string;
}> = ({ text, isActive, dataCy }) => {
  return (
    <Button
      data-cy={dataCy}
      color={isActive ? "primary" : "secondary"}
      variant="textContained"
      size="large"
      sx={{ pointerEvents: "none" }}
    >
      {text}
    </Button>
  )
}

export default memo(function SendCardContainer({ children }: { children: PropsWithChildren["children"] }) {
  const theme = useTheme();
  const { network } = useExpectedNetwork();

  const router = useRouter();
  const isActiveRoute = (...routes: Array<string>) =>
    routes.includes(router.route);

  return (
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
        <TabButton text="Stream" isActive={isActiveRoute("/send")} dataCy="send-or-modify-stream" />
        <TabButton text="Transfer" isActive={isActiveRoute("/transfer")} dataCy="transfer" />
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
  );
});
