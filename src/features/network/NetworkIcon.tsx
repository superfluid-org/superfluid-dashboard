import { Avatar, SxProps, Theme } from "@mui/material";
import { FC } from "react";
import { Network } from "./networks";

export interface NetworkIconProps {
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
      <Avatar data-cy={`${network.id}-icon`} src={network.icon}
        alt={`${network.name} network icon`}
        sx={{ width: size, height: size, ...sx }}
      />
    );
  }

  return (
    <Avatar
      data-cy={`${network.id}-icon`}
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
