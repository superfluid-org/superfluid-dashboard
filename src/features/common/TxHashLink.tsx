import { FC } from "react";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import { Network } from "../network/networks";
import { Box, IconButton, Tooltip } from "@mui/material";
import Link from "next/link";

interface TxHashLinkProps {
  txHash: string;
  network: Network;
}

const TxHashLink: FC<TxHashLinkProps> = ({ txHash, network }) => (
  <Tooltip title="View on blockchain explorer" arrow placement="top">
    <Box component="span">
      <Link
        passHref
        href={network.getLinkForTransaction(txHash)}
        target="_blank"
      >
        <IconButton href="" color="inherit" target="_blank">
          <LaunchRoundedIcon />
        </IconButton>
      </Link>
    </Box>
  </Tooltip>
);

export default TxHashLink;
