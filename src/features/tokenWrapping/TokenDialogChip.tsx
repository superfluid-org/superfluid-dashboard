import { FC, useEffect, useState } from "react";
import { TokenUpgradeDowngradePair } from "../redux/endpoints/adHocSubgraphEndpoints";
import { Chip, Stack } from "@mui/material";
import TokenIcon from "../token/TokenIcon";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TokenDialog } from "./TokenDialog";

export const TokenDialogChip: FC<{
  selectedTokenPair?: TokenUpgradeDowngradePair;
  onSelect: (tokenUpgrade: TokenUpgradeDowngradePair | undefined) => void;
  prioritizeSuperTokens: boolean;
}> = ({ prioritizeSuperTokens, onSelect, selectedTokenPair }) => {
  const [open, setOpen] = useState(false);

  const [_selectedTokenPair, setSelectedTokenPair] = useState<
    TokenUpgradeDowngradePair | undefined
  >(selectedTokenPair);

  useEffect(() => {
    setSelectedTokenPair(selectedTokenPair);
  }, [selectedTokenPair]);

  const onChipClick = () => {
    setOpen(true);
  };

  const onDialogClose = () => {
    setOpen(false);
  };

  const _onSelect = (token: TokenUpgradeDowngradePair) => {
    setSelectedTokenPair(token);
    onSelect(token);
    setOpen(false);
  };

  const tokenSymbol = prioritizeSuperTokens
    ? _selectedTokenPair?.superToken.symbol
    : _selectedTokenPair?.underlyingToken.symbol;

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
