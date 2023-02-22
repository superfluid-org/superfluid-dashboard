import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import {
  Stack,
  Paper,
  Typography,
  Chip,
  Box,
  useTheme,
  useMediaQuery,
  Link as MuiLink,
} from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { FC, useMemo } from "react";
import NetworkIcon from "../network/NetworkIcon";
import { Network, tryFindNetwork, allNetworks } from "../network/networks";

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

  const availableOnNetworks = useMemo(
    () =>
      app.chains.reduce((accumulator, chainId) => {
        const network = tryFindNetwork(allNetworks, chainId);
        if (!network) return accumulator;
        return accumulator.concat([network]);
      }, [] as Array<Network>),
    [app]
  );

  return (
    <Link passHref href={app.href}>
      <Paper
        data-cy={`${app.name}-section`}
        elevation={1}
        component={MuiLink}
        target="_blank"
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: isBelowMd ? 1 : 1.5,
          p: 3.5,
          background: `linear-gradient(77deg, ${app.colors.primary} 0%, ${app.colors.secondary} 100%)`,
          color: "white",
          border: "none",
          transform: "scale(1)",
          transition: theme.transitions.create("transform", {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
          }),
          [theme.breakpoints.up("md")]: {
            "&:hover": {
              transform: "scale(1.07)",
            },
          },
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

          <Typography
            variant={isBelowMd ? "h5" : "h4"}
            flex={1}
            data-cy={"app-name"}
          >
            {app.name}
          </Typography>
          <LaunchRoundedIcon sx={{ fontSize: "20px" }} />
        </Stack>
        <Typography
          data-cy={"app-description"}
          variant={isBelowMd ? "body2" : "body1"}
          component="p"
          translate="yes"
        >
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
              {availableOnNetworks.map((network, index) => (
                <NetworkIcon
                  key={network.id}
                  network={network}
                  size={20}
                  sx={{ mx: -0.25, zIndex: availableOnNetworks.length - index }}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Link>
  );
};

export default EcosystemItem;
