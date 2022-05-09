import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button } from "@mui/material";
import { FC, useState } from "react";
import { TokenMinimal } from "../redux/endpoints/adHocSubgraphEndpoints";
import TokenIcon from "../token/TokenIcon";
import { TokenDialog, TokenSelectionProps } from "./TokenDialog";

export const TokenDialogChip: FC<{
  token: TokenMinimal | undefined,
  tokenSelection: TokenSelectionProps,
  onTokenSelect: (token: TokenMinimal) => void;
}> = ({ token, tokenSelection, onTokenSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={!!token ? <TokenIcon tokenSymbol={token.symbol} /> : <></>}
        endIcon={<ExpandMoreIcon />}
        onClick={() => setOpen(true)}
      >
          {!!token ? token.symbol : "Select a token"}
      </Button>
            <TokenDialog
            open={open}
            onClose={() => setOpen(false)}
            onSelect={(token: TokenMinimal) => {
            onTokenSelect(token);
            setOpen(false);
        }}
            tokenSelection={tokenSelection}
            />
    </>
  );
};
