import {
  Button,
  CircularProgress,
  IconButton,
  ListItemAvatar,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import TokenIcon from "../token/TokenIcon";
import { FC, MouseEvent, useMemo, useState } from "react";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import { Network } from "../network/networks";
import { useNetworkCustomTokens } from "../customTokens/customTokens.slice";
import { subgraphApi } from "../redux/store";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import { getSuperTokenType } from "../redux/endpoints/adHocSubgraphEndpoints";
import { TokenType } from "../redux/endpoints/tokenTypes";

interface Token {
  type: TokenType;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  isListed: boolean;
}

interface ItemProps {
  token: Token;
  selected: boolean;
  onClick: () => void;
}

const TOKEN_SIZE = 24;

const TokenMenu: FC<{
  network: Network;
  open: boolean;
  handleClose: () => void;
  anchorEl: HTMLElement | null;
  onChange: (token: Token) => void;
  onBlur: () => void;
  token: Token | undefined | null;
}> = ({ network, anchorEl, open, handleClose, onChange, onBlur, token }) => {
  const theme = useTheme();

  const networkCustomTokens = useNetworkCustomTokens(network.id);
  const listedSuperTokensQuery = subgraphApi.useTokensQuery({
    chainId: network.id,
    filter: {
      isSuperToken: true,
      isListed: true,
    },
  });

  const customSuperTokensQuery = subgraphApi.useTokensQuery(
    networkCustomTokens.length > 0
      ? {
          chainId: network.id,
          filter: {
            isSuperToken: true,
            isListed: false,
            id_in: networkCustomTokens,
          },
        }
      : skipToken
  );

  const superTokens = useMemo(
    () =>
      (listedSuperTokensQuery.data?.items || [])
        .concat(customSuperTokensQuery.data?.items || [])
        .map((x) => ({
          type: getSuperTokenType({ ...x, network, address: x.id }),
          address: x.id,
          name: x.name,
          symbol: x.symbol,
          decimals: 18,
          isListed: x.isListed,
        })),
    [network, listedSuperTokensQuery.data, customSuperTokensQuery.data]
  );

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      onBlur={onBlur}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      PaperProps={{ sx: { minWidth: 280 }, square: true }}
      sx={{ marginTop: theme.spacing(1.5) }}
    >
      {customSuperTokensQuery.isLoading || listedSuperTokensQuery.isLoading ? (
        <MenuItem>
          <CircularProgress size={20} />
        </MenuItem>
      ) : (
        superTokens.map((_token) => (
          <TokenItem
            key={_token.address}
            onClick={() => {
              onChange(_token);
              handleClose();
            }}
            selected={_token.address === token?.address}
            token={_token}
          />
        ))
      )}
    </Menu>
  );
};

const TokenItem: FC<ItemProps> = ({ token, selected, onClick }) => (
  <MenuItem
    data-cy={`item-${token.address}-button`}
    key={token.address}
    onClick={onClick}
    selected={selected}
    sx={{ height: 50 }}
  >
    <ListItemAvatar sx={{ mr: 1 }}>
      <TokenIcon
        size={TOKEN_SIZE}
        isSuper
        tokenSymbol={token.symbol}
        isUnlisted={!token.isListed}
      />
    </ListItemAvatar>
    {token.symbol}
  </MenuItem>
);

const TokenSelect: FC<{
  network: Network | undefined | null;
  token: Token | undefined | null;
  onChange: (token: Token) => void;
  onBlur: () => void;
  placeholder?: string;
  disabled: boolean;
}> = ({ network, token, onChange, onBlur, placeholder, disabled }) => {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);
  const handleOpen = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      {/* {!isBelowMd ? ( */}
      <Button
        disabled={disabled}
        variant="outlined"
        color="secondary"
        size="large"
        fullWidth={true}
        startIcon={
          token && (
            <TokenIcon
              size={TOKEN_SIZE}
              isSuper
              tokenSymbol={token.symbol}
              isUnlisted={!token.isListed}
            />
          )
        }
        endIcon={<OpenIcon open={open} />}
        onClick={handleOpen}
        sx={{
          minWidth: "200px",
          justifyContent: "flex-start",
          ".MuiButton-startIcon > *:nth-of-type(1)": { fontSize: "16px" },
          ".MuiButton-endIcon": { marginLeft: "auto" },
        }}
        translate="no"
      >
        {token?.symbol || placeholder}
      </Button>
      {network ? (
        <TokenMenu
          token={token}
          onChange={onChange}
          onBlur={onBlur}
          network={network}
          open={open}
          handleClose={handleClose}
          anchorEl={anchorEl}
        />
      ) : null}
    </>
  );
};

export default TokenSelect;
