import AddCircleOutline from "@mui/icons-material/AddCircleOutline";
import {
  IconButton,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { FC } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import {
  isSuper,
  isUnderlying,
  isWrappable,
  TokenMinimal,
} from "../redux/endpoints/tokenTypes";
import { rpcApi } from "../redux/store";
import Amount from "../token/Amount";
import FlowingBalance from "../token/FlowingBalance";
import TokenIcon from "../token/TokenIcon";
import Link from "../common/Link";

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
  flowRate,
  onClick,
  ...props
}) => {
  const { network } = useExpectedNetwork();

  const isSuperToken = isSuper(token);
  const isUnderlyingToken = isUnderlying(token);
  const isWrappableSuperToken = isSuperToken && isWrappable(token);

  const isListed = isUnderlying(token) || (isSuper(token) && token.isListed);

  const { data: _discard, ...underlyingBalanceQuery } =
    rpcApi.useUnderlyingBalanceQuery(
      chainId && accountAddress && isUnderlyingToken
        ? {
          chainId,
          accountAddress,
          tokenAddress: token.address,
        }
        : skipToken
    );

  const { data: _discard2, ...realtimeBalanceQuery } =
    rpcApi.useRealtimeBalanceQuery(
      chainId && accountAddress && isSuperToken
        ? {
          chainId,
          accountAddress,
          tokenAddress: token.address,
        }
        : skipToken
    );

  const checkedBalanceWei = isSuper(token)
    ? realtimeBalanceQuery?.currentData?.balance || balanceWei
    : underlyingBalanceQuery?.currentData?.balance || balanceWei;

  const balanceTimestamp =
    realtimeBalanceQuery?.currentData?.balanceTimestamp ||
    props.balanceTimestamp;

  const fRate = realtimeBalanceQuery?.currentData?.flowRate || flowRate;

  return (
    <ListItemButton
      data-cy={`${token.symbol}-list-item`}
      onClick={onClick}
      sx={{ px: 3 }}
    >
      <ListItemAvatar>
        <TokenIcon
          isSuper={isSuperToken}
          chainId={chainId}
          tokenAddress={token.address}
          isUnlisted={!isListed}
        />
      </ListItemAvatar>

      <ListItemText
        data-cy={"token-symbol-and-name"}
        primary={token.symbol}
        secondary={token.name}
        translate="no"
      />

      <Typography
        variant="h6mono"
        component={Stack}
        direction="row"
        alignItems="center"
        data-cy={"token-balance"}
      >
        {!!accountAddress &&
          checkedBalanceWei &&
          (balanceTimestamp && fRate ? (
            <FlowingBalance
              balance={checkedBalanceWei}
              balanceTimestamp={balanceTimestamp}
              flowRate={fRate}
            />
          ) : (
            <Amount
              wei={checkedBalanceWei}
              decimals={token.decimals}
              roundingIndicator="~"
            />
          ))}
        {(showUpgrade && isWrappableSuperToken) ? (
          <Tooltip title="Wrap">
            <IconButton
              LinkComponent={Link}
              href={`/wrap?upgrade&token=${token.address}&network=${network.slugName}`}
              data-cy={"wrap-button"}
            >
              <AddCircleOutline />
            </IconButton>
          </Tooltip>
        ) : <IconButton sx={{ visibility: "hidden" }}><AddCircleOutline /></IconButton>}
      </Typography>
    </ListItemButton>
  );
};
