import { FC, useState } from "react";
import { SuperTokenPair, TokenMinimal } from "../redux/endpoints/adHocSubgraphEndpoints";
import { Chip, Stack } from "@mui/material";
import TokenIcon from "../token/TokenIcon";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TokenDialog, TokenSelectionProps } from "./TokenDialog";

export const TokenDialogChip: FC<{
  token: TokenMinimal | undefined,
  tokenSelection: TokenSelectionProps,
  onTokenSelect: (token: TokenMinimal) => void;
}> = ({ token, tokenSelection, onTokenSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Chip
        icon={!!token ? <TokenIcon tokenSymbol={token.symbol} /> : <></>}
        label={
          <>
            <Stack direction="row" alignItems="center">
              {!!token ? token.symbol : "Select a token"} <ExpandMoreIcon />
            </Stack>
          </>
        }
        onClick={() => setOpen(true)}
      ></Chip>
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
