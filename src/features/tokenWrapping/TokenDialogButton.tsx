import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button, ButtonProps, Paper } from "@mui/material";
import { FC, useState } from "react";
import { useExpectedNetwork } from "../network/ExpectedNetworkContext";
import { isUnderlying, TokenMinimal } from "../redux/endpoints/tokenTypes";
import TokenIcon from "../token/TokenIcon";
import { useTokenIsListed } from "../token/useTokenIsListed";
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
  const { network } = useExpectedNetwork();
  const isUnderlyingToken = token && isUnderlying(token);
  const [isListed, isListedLoading] = useTokenIsListed(
    network.id,
    token?.address
  );

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
              tokenSymbol={token.symbol}
              isUnlisted={!isUnderlyingToken && !isListed}
              isLoading={isListedLoading}
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
        {!!token ? token.symbol : "Select a token"}
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
