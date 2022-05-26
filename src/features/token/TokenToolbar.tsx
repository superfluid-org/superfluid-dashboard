import { FC } from "react";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RemoveIcon from "@mui/icons-material/Remove";
import { Stack, IconButton, Typography, Chip } from "@mui/material";
import NetworkIcon from "../network/NetworkIcon";
import TokenIcon from "./TokenIcon";
import { Address, Token } from "@superfluid-finance/sdk-core";
import { useNetworkContext } from "../network/NetworkContext";
import { subgraphApi } from "../redux/store";

interface TokenToolbarProps {
  symbol: string;
  name: string;
  onBack?: () => void;
}

const TokenToolbar: FC<TokenToolbarProps> = ({ symbol, name, onBack }) => {
  const { network } = useNetworkContext();

  return (
    <Stack direction="row" alignItems="center" gap={2}>
      <IconButton color="inherit" onClick={onBack}>
        <ArrowBackIcon />
      </IconButton>
      <TokenIcon tokenSymbol={symbol} />
      <Typography variant="h3">{name}</Typography>
      <Typography variant="h4" color="text.secondary">
        {symbol}
      </Typography>
      <Chip
        size="small"
        label={network.displayName}
        avatar={<NetworkIcon network={network} size={18} fontSize={14} />}
      />

      <Stack
        direction="row"
        gap={2}
        flex={1}
        alignItems="center"
        justifyContent="flex-end"
      >
        <IconButton color="primary">
          <AddIcon />
        </IconButton>
        <IconButton color="primary">
          <RemoveIcon />
        </IconButton>
      </Stack>
    </Stack>
  );
};

export default TokenToolbar;
