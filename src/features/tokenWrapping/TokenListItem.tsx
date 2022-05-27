import {
  IconButton,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { FC } from "react";
import TokenIcon from "../token/TokenIcon";
import EtherFormatted from "../token/EtherFormatted";
import FlowingBalance from "../token/FlowingBalance";
import { rpcApi } from "../redux/store";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import Link from "next/link";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import {
  isSuper,
  isUnderlying,
  isWrappable,
  TokenMinimal
} from "../redux/endpoints/tokenTypes";

const etherDecimalPlaces = 8;

interface TokenListItemProps {
  chainId?: number;
  accountAddress?: string;
  balanceWei?: string;
  balanceTimestamp?: number;
  flowRate?: string;
  token: TokenMinimal;
  showUpgrade: boolean;
  onClick?: () => void;
}

// TODO(KK): memo?
export const TokenListItem: FC<TokenListItemProps> = ({
  chainId,
  accountAddress,
  token,
  showUpgrade,
  balanceWei,
  balanceTimestamp,
  flowRate,
  onClick,
}) => {
  const { network } = useExpectedNetwork();

  const isSuperToken = isSuper(token);
  const isUnderlyingToken = isUnderlying(token);
  const isWrappableSuperToken = isSuperToken && isWrappable(token);

  const underlyingBalanceQuery = rpcApi.useUnderlyingBalanceQuery(
    chainId && accountAddress && isUnderlyingToken
      ? {
          chainId,
          accountAddress,
          tokenAddress: token.address,
        }
      : skipToken
  );

  const realtimeBalanceQuery = rpcApi.useRealtimeBalanceQuery(
    chainId && accountAddress && isSuperToken
      ? {
          chainId,
          accountAddress,
          tokenAddress: token.address,
        }
      : skipToken
  );

  const checkedBalanceWei = isSuper(token)
    ? realtimeBalanceQuery?.data?.balance || balanceWei
    : underlyingBalanceQuery?.data?.balance || balanceWei;

  const balanceTS =
    realtimeBalanceQuery?.data?.balanceTimestamp || balanceTimestamp;

  const fRate = realtimeBalanceQuery?.data?.flowRate || flowRate;

  return (
    <ListItemButton onClick={onClick} sx={{ px: 3 }}>
      <ListItemAvatar>
        <TokenIcon tokenSymbol={token.symbol}></TokenIcon>
      </ListItemAvatar>

      <ListItemText primary={token.symbol} secondary={token.name} />

      <Typography
        variant="h6mono"
        component={Stack}
        direction="row"
        alignItems="center"
      >
        {!!accountAddress &&
          checkedBalanceWei &&
          (balanceTS && fRate ? (
            <FlowingBalance
              balance={checkedBalanceWei}
              balanceTimestamp={balanceTS}
              flowRate={fRate}
              etherDecimalPlaces={etherDecimalPlaces}
            />
          ) : (
            <EtherFormatted
              wei={checkedBalanceWei}
              etherDecimalPlaces={etherDecimalPlaces}
            />
          ))}
        {showUpgrade && isWrappableSuperToken && (
          <Link
            href={`/wrap?upgrade&token=${token.address}&network=${network.slugName}`}
            passHref
          >
            <Tooltip title="Wrap">
              <IconButton>
                <AddCircleOutline></AddCircleOutline>
              </IconButton>
            </Tooltip>
          </Link>
        )}
      </Typography>
    </ListItemButton>
  );
};
