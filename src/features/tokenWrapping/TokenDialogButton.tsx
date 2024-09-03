import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, ButtonProps } from "@mui/material";
import { FC, useState } from "react";
import {
  isSuper,
  isUnderlying,
  TokenMinimal,
} from "../redux/endpoints/tokenTypes";
import TokenIcon from "../token/TokenIcon";
import TokenDialog from "./TokenDialog";
import { Network } from "../network/networks";
import { EMPTY_ARRAY } from "../../utils/constants";

export const TokenDialogButton: FC<{
  token: TokenMinimal | null | undefined;
  ButtonProps?: ButtonProps;
  onTokenSelect: (token: TokenMinimal) => void;
  onBlur?: () => void;
  network: Network;
  tokens: TokenMinimal[];
  isTokensFetching: boolean;
  showUpgrade?: boolean;
}> = ({
  token = null,
  tokens = EMPTY_ARRAY,
  isTokensFetching = false,
  ButtonProps = {},
  onTokenSelect,
  onBlur = () => { },
  network,
  showUpgrade = false,
}) => {
    const [open, setOpen] = useState(false);
    const isUnderlyingToken = !token?.isSuperToken;
    const isSuperToken = token && isSuper(token);
    const isListed = isSuperToken ? token.isListed : false;

    return (
      <>
        <Button
          data-cy={"select-token-button"}
          variant="outlined"
          color="secondary"
          startIcon={
            !!token && (
              <TokenIcon
                size={24}
                isSuper={!!isSuperToken}
                chainId={network.id}
                tokenAddress={token.address}
                isUnlisted={!isUnderlyingToken && !isListed}
                isLoading={false}
              />
            )
          }
          endIcon={<ExpandMoreIcon sx={{ ml: 1 }} />}
          onClick={() => setOpen(true)}
          sx={{
            flexGrow: 1,
            ".MuiButton-endIcon": {
              ml: "auto",
            },
          }}
          {...ButtonProps}
        >
          {!!token ? (
            <span translate="no">{token.symbol}</span>
          ) : (
            <span translate="yes">Select a token</span>
          )}
        </Button>

        <TokenDialog
          open={open}
          onClose={() => {
            setOpen(false);
            onBlur();
          }}
          onSelect={(token: TokenMinimal) => {
            onTokenSelect(token);
            setOpen(false);
            onBlur();
          }}
          tokens={tokens}
          isTokensFetching={isTokensFetching}
          network={network}
          showUpgrade={showUpgrade}
        />
      </>
    );
  };
