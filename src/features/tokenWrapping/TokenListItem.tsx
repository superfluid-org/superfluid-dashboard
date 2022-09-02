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
import Link from "next/link";
import { FC, memo, useCallback } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import {
  isSuper,
  isUnderlying,
  isWrappable,
  TokenMinimal,
  TokenWithIcon,
} from "../redux/endpoints/tokenTypes";
import { rpcApi } from "../redux/store";
import Amount from "../token/Amount";
import FlowingBalance from "../token/FlowingBalance";
import TokenIcon from "../token/TokenIcon";

interface TokenListItemProps {
  chainId?: number;
  accountAddress?: string;
  balanceWei?: string;
  balanceTimestamp?: number;
  flowRate?: string;
  token: TokenMinimal & TokenWithIcon;
  showUpgrade: boolean;
  onClick: (token: TokenMinimal) => void;
}

const TokenListItem: FC<TokenListItemProps> = ({
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

  const isListed = isUnderlying(token) || !!token.isListed;

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

  const handleClick = useCallback(() => {
    onClick(token);
  }, [token, onClick]);

  return (
    <ListItemButton
      data-cy={`${token.symbol}-list-item`}
      onClick={handleClick}
      sx={{ px: 3 }}
    >
      <ListItemAvatar>
        <TokenIcon
          isSuper={isSuperToken}
          tokenSymbol={token.symbol}
          isUnlisted={!isListed}
          iconUrl={token.iconUrl}
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
        {showUpgrade && isWrappableSuperToken && (
          <Link
            href={`/wrap?upgrade&token=${token.address}&network=${network.slugName}`}
            passHref
          >
            <Tooltip title="Wrap">
              <IconButton data-cy={"wrap-button"}>
                <AddCircleOutline></AddCircleOutline>
              </IconButton>
            </Tooltip>
          </Link>
        )}
      </Typography>
    </ListItemButton>
  );
};

export default memo(TokenListItem);
