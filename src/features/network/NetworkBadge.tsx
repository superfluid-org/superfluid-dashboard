import { SxProps, Theme } from "@mui/material";
import { FC } from "react";
import NetworkIcon from "./NetworkIcon";
import { Network } from "./networks";

interface NetworkBadgeProps {
  network: Network;
  sx?: SxProps<Theme>;
}

const NetworkBadge: FC<NetworkBadgeProps> = ({ network, sx = {} }) => (
  <NetworkIcon
    network={network}
    size={24}
    fontSize={14}
    sx={{
      ...sx,
      p: 0.25,
      backgroundColor: network.color,
      borderRadius: "0 0 8px 8px",
      boxShadow: "0px 2px 3px rgba(0, 0, 0, 0.25)",
    }}
  />
);

export default NetworkBadge;
