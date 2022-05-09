import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button } from "@mui/material";
import { FC, useState } from "react";
import { WrappedSuperTokenPair } from "../redux/endpoints/adHocSubgraphEndpoints";
import TokenIcon from "../token/TokenIcon";
import { useSelectedTokenContext } from "./SelectedTokenPairContext";
import { TokenDialog } from "./TokenDialog";

export const TokenDialogChip: FC<{
  prioritizeSuperTokens: boolean;
}> = ({ prioritizeSuperTokens }) => {
  const [open, setOpen] = useState(false);

  const { selectedTokenPair, setSelectedTokenPair } = useSelectedTokenContext();

  const onChipClick = () => {
    setOpen(true);
  };

  const onDialogClose = () => {
    setOpen(false);
  };

  const _onSelect = (token: WrappedSuperTokenPair) => {
    setSelectedTokenPair(token);
    setOpen(false);
  };

  const tokenSymbol = prioritizeSuperTokens
    ? selectedTokenPair?.superToken.symbol
    : selectedTokenPair?.underlyingToken.symbol;

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={
          tokenSymbol ? (
            <TokenIcon tokenSymbol={tokenSymbol} size={24} />
          ) : (
            <></>
          )
        }
        endIcon={<ExpandMoreIcon />}
        onClick={onChipClick}
      >
        {tokenSymbol ?? "Select a token"}
      </Button>
      <TokenDialog
        prioritizeSuperTokens={prioritizeSuperTokens}
        open={open}
        onClose={onDialogClose}
        onSelect={_onSelect}
      />
    </>
  );
};
