import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button } from "@mui/material";
import { FC, useState } from "react";
import { TokenMinimal } from "../redux/endpoints/tokenTypes";
import TokenIcon from "../token/TokenIcon";
import { TokenDialog, TokenSelectionProps } from "./TokenDialog";

export const TokenDialogButton: FC<{
  token: TokenMinimal | null | undefined;
  tokenSelection: TokenSelectionProps;
  onTokenSelect: (token: TokenMinimal) => void;
  onBlur?: () => void;
}> = ({ token = null, tokenSelection, onTokenSelect, onBlur = () => {} }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        data-cy={"select-token-button"}
        variant="outlined"
        color="secondary"
        startIcon={
          !!token ? <TokenIcon size={24} tokenSymbol={token.symbol} /> : <></>
        }
        endIcon={<ExpandMoreIcon sx={{ ml: 1 }} />}
        onClick={() => setOpen(true)}
        sx={{
          flexGrow: 1,
          ".MuiButton-endIcon": {
            ml: "auto",
          },
        }}
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
