import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import {
  Stack,
  Paper,
  Typography,
  IconButton,
  Chip,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { FC, useMemo } from "react";
import NetworkIcon from "../network/NetworkIcon";
import { Network, networksByChainId } from "../network/networks";

export interface EcosystemApp {
  name: string;
  href: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
  chains: number[];
  colors: {
    primary: string;
    secondary: string;
  };
}

interface EcosystemItemProps {
  app: EcosystemApp;
}

const EcosystemItem: FC<EcosystemItemProps> = ({ app }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const networks = useMemo(
    () =>
      app.chains.reduce((allNetworks, chainId) => {
        const network = networksByChainId.get(chainId);
        if (!network) return allNetworks;
        return allNetworks.concat([network]);
      }, [] as Array<Network>),
    [app]
  );

  return (
    <Stack
      data-cy={`${app.name}-section`}
      component={Paper}
      elevation={1}
      gap={isBelowMd ? 1 : 1.5}
      sx={{
        p: 3.5,
        background: `linear-gradient(77deg, ${app.colors.primary} 0%, ${app.colors.secondary} 100%)`,
        color: "white",
        border: "none",
      }}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        <Image
          unoptimized
          src={app.icon}
          width={26}
          height={26}
          layout="fixed"
          alt="Twitter logo"
        />

        <Typography variant={isBelowMd ? "h5" : "h4"} flex={1} data-cy={"app-name"}>
          {app.name}
        </Typography>
        {app.href && (
          <Link passHref href={app.href} target="_blank">
            <IconButton
              data-cy={"app-link-button"}
              href=""
              color="inherit"
              target="_blank"
              sx={{ color: "white", mr: -0.75 }}
            >
              <LaunchRoundedIcon sx={{ fontSize: "20px" }} />
            </IconButton>
          </Link>
        )}
      </Stack>
      <Typography data-cy={"app-description"} variant={isBelowMd ? "body2" : "body1"}>
        {app.description}
      </Typography>
      <Stack flex={1} justifyContent="flex-end">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          {app.comingSoon ? (
            <Chip
              data-cy={"app-comming-soon"}
              color="info"
              size="small"
              label="Coming Soon"
              sx={{ color: "white" }}
            />
          ) : (
            <Box />
          )}

          <Stack direction="row" alignItems="center" sx={{ px: 0.25 }}>
            {networks.map((network, index) => (
              <NetworkIcon
                key={network.id}
                network={network}
                size={20}
                sx={{ mx: -0.25, zIndex: networks.length - index }}
              />
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default EcosystemItem;
