import { FC } from "react";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import { Network } from "../network/networks";
import { Box, IconButton, Tooltip } from "@mui/material";
import Link from "./Link";

interface TxHashLinkProps {
  txHash: string;
  network: Network;
}

const TxHashLink: FC<TxHashLinkProps> = ({ txHash, network }) => (
  <Tooltip title="View on blockchain explorer" arrow placement="top">
    <Box data-cy={"tx-hash-link"} component="span">
      <IconButton
        component={Link}
        href={network.getLinkForTransaction(txHash)}
        color="inherit"
        target="_blank"
      >
        <LaunchRoundedIcon />
      </IconButton>
    </Box>
  </Tooltip>
);

export default TxHashLink;
