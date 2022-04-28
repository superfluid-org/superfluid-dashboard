import { FC, useState } from "react";
import { WrappedSuperTokenPair } from "../redux/endpoints/adHocSubgraphEndpoints";
import { Chip, Stack } from "@mui/material";
import TokenIcon from "../token/TokenIcon";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TokenDialog } from "./TokenDialog";
import { useSelectedTokenContext } from "./SelectedTokenPairContext";

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
      <Chip
        icon={tokenSymbol ? <TokenIcon tokenSymbol={tokenSymbol} /> : <></>}
        label={
          <>
            <Stack direction="row" alignItems="center">
              {tokenSymbol ?? "Select a token"} <ExpandMoreIcon />
            </Stack>
          </>
        }
        onClick={onChipClick}
      ></Chip>
      <TokenDialog
        prioritizeSuperTokens={prioritizeSuperTokens}
        open={open}
        onClose={onDialogClose}
        onSelect={_onSelect}
      />
    </>
  );
};
