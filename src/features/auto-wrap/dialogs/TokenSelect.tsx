import {
    Button,
    CircularProgress,
    ListItemAvatar,
    Menu,
    MenuItem,
    useTheme,
} from "@mui/material";
import { FC, MouseEvent, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/dist/query";
import OpenIcon from "../../../components/OpenIcon/OpenIcon";
import TokenIcon from "../../token/TokenIcon";
import { useNetworkCustomTokens } from "../../customTokens/customTokens.slice";
import { subgraphApi } from "../../redux/store";
import { Network } from "../../network/networks";
import { getSuperTokenType } from "../../redux/endpoints/adHocSubgraphEndpoints";
import { Token, Token_Filter } from "@superfluid-finance/sdk-core";

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
    token: Token | undefined;
    filterArgs: Token_Filter;
}> = ({ network, anchorEl, open, handleClose, onChange, token, filterArgs}) => {
    const theme = useTheme();
    const networkCustomTokens = useNetworkCustomTokens(network.id);
    const listedSuperTokensQuery = subgraphApi.useTokensQuery({
        chainId: network.id,
        filter: {
            isSuperToken: true,
            isListed: true,
            ...filterArgs
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
                    ...x,
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
                        selected={_token.address === token?.id}
                        token={_token}
                    />
                ))
            )}
        </Menu>
    );
};

const TokenItem: FC<ItemProps> = ({ token, selected, onClick }) => (
    <MenuItem
        data-cy={`item-${token.id}-button`}
        key={token.id}
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
    network: Network | undefined;
    token: Token | undefined;
    onChange: (token: Token) => void;
    placeholder?: string;
    disabled: boolean;
    filterArgs?: Token_Filter | undefined;
}> = ({ network, token, onChange, placeholder, disabled, filterArgs = {} }) => {
    const theme = useTheme();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const open = Boolean(anchorEl);
    const handleOpen = (event: MouseEvent<HTMLButtonElement>) =>
        setAnchorEl(event.currentTarget);

    const handleClose = () => setAnchorEl(null);

    return (
        <>
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
                    network={network}
                    open={open}
                    handleClose={handleClose}
                    anchorEl={anchorEl}
                    filterArgs={filterArgs}
                />
            ) : null}
        </>
    );
};

export default TokenSelect;