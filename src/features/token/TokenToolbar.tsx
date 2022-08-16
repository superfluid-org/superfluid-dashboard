import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Token } from "@superfluid-finance/sdk-core";
import Link from "next/link";
import { FC } from "react";
import NetworkIcon from "../network/NetworkIcon";
import { Network } from "../network/networks";
import TokenIcon from "./TokenIcon";

interface TokenToolbarData {
  symbol: string;
  name: string;
  isUnlisted: boolean;
}

const TokenToolbarData: FC<TokenToolbarData> = ({
  symbol,
  name,
  isUnlisted,
}) => (
  <Stack direction="row" alignItems="center" gap={2}>
    <TokenIcon isSuper tokenSymbol={symbol} isUnlisted={isUnlisted} />
    <Typography variant="h3" component="h1">
      {name}
    </Typography>
    <Typography variant="h4" color="text.secondary">
      {symbol}
    </Typography>
  </Stack>
);

interface TokenToolbarProps {
  token: Token;
  network: Network;
  onBack?: () => void;
}

const TokenToolbar: FC<TokenToolbarProps> = ({ token, network, onBack }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const { symbol, name, isListed } = token;

  return (
    <Stack gap={3}>
      <Stack direction="row" alignItems="center" gap={2}>
        <IconButton color="inherit" onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>

        {!isBelowMd && (
          <>
            <TokenToolbarData
              symbol={symbol}
              name={name}
              isUnlisted={!isListed}
            />
            <Chip
              size="small"
              label={network.name}
              avatar={<NetworkIcon network={network} size={18} fontSize={14} />}
            />
          </>
        )}

        <Stack
          direction="row"
          gap={2}
          flex={1}
          alignItems="center"
          justifyContent="flex-end"
        >
          <Link
            href={`/wrap?upgrade&token=${token.id}&network=${network.slugName}`}
            passHref
          >
            <Tooltip title="Wrap">
              <IconButton color="primary">
                <AddIcon />
              </IconButton>
            </Tooltip>
          </Link>
          <Link
            href={`/wrap?downgrade&token=${token.id}&network=${network.slugName}`}
            passHref
          >
            <Tooltip title="Unwrap">
              <IconButton color="primary">
                <RemoveIcon />
              </IconButton>
            </Tooltip>
          </Link>
        </Stack>
      </Stack>

      {isBelowMd && (
        <TokenToolbarData symbol={symbol} name={name} isUnlisted={!isListed} />
      )}
    </Stack>
  );
};

export default TokenToolbar;
