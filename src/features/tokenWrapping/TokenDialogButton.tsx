import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, ButtonProps } from "@mui/material";
import { FC, useState } from "react";
import {
  isSuper,
  isUnderlying,
  TokenMinimal,
} from "../redux/endpoints/tokenTypes";
import TokenIcon from "../token/TokenIcon";
import TokenDialog, { TokenSelectionProps } from "./TokenDialog";

export const TokenDialogButton: FC<{
  token: TokenMinimal | null | undefined;
  tokenSelection: TokenSelectionProps;
  ButtonProps?: ButtonProps;
  onTokenSelect: (token: TokenMinimal) => void;
  onBlur?: () => void;
}> = ({
  token = null,
  tokenSelection,
  ButtonProps = {},
  onTokenSelect,
  onBlur = () => {},
}) => {
  const [open, setOpen] = useState(false);
  const isUnderlyingToken = token && isUnderlying(token);
  const isSuperToken = token && isSuper(token);

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
              tokenSymbol={token.symbol}
              isUnlisted={!isUnderlyingToken && !token.isListed}
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
        tokenSelection={tokenSelection}
      />
    </>
  );
};
