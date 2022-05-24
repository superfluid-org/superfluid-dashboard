import { Avatar } from "@mui/material";
import { FC } from "react";
import { Network } from "./networks";

interface NetworkIconProps {
  network: Network;
  fontSize?: number;
  size?: number;
}

const NetworkIcon: FC<NetworkIconProps> = ({
  network,
  fontSize = 20,
  size = 36,
}) => {
  if (!network.testnet)
    return <Avatar src={network.icon} sx={{ width: size, height: size }} />;

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: `${fontSize}px`,
        backgroundColor: network.color,
      }}
    >
      {network.name.charAt(0)}
    </Avatar>
  );
};

export default NetworkIcon;
