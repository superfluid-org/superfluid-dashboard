import { Avatar, SxProps, Theme } from "@mui/material";
import { FC } from "react";
import { Network } from "./networks";

interface NetworkIconProps {
  network: Network;
  fontSize?: number;
  size?: number;
  sx?: SxProps<Theme>;
}

const NetworkIcon: FC<NetworkIconProps> = ({
  network,
  fontSize = 20,
  size = 36,
  sx = {},
}) => {
  if (!network.testnet) {
    return (
      <Avatar src={network.icon} sx={{ width: size, height: size, ...sx }} />
    );
  }

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: `${fontSize}px`,
        backgroundColor: network.color,
        ...sx,
      }}
    >
      {network.name.charAt(0)}
    </Avatar>
  );
};

export default NetworkIcon;
