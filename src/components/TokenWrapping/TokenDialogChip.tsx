import { FC, useEffect, useState } from "react";
import { TokenUpgradeDowngradePair } from "../../redux/endpoints/adHocSubgraphEndpoints";
import { Chip, Stack } from "@mui/material";
import TokenIcon from "../TokenIcon";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { TokenDialog } from "./TokenDialog";

export const TokenDialogChip: FC<{
  _selectedToken?: TokenUpgradeDowngradePair;
  onChange: (tokenUpgrade: TokenUpgradeDowngradePair | undefined) => void;
  prioritizeSuperTokens: boolean;
}> = ({ prioritizeSuperTokens, onChange, _selectedToken }) => {
  const [open, setOpen] = useState(false);

  const [selectedToken, setSelectedToken] = useState<
    TokenUpgradeDowngradePair | undefined
  >(_selectedToken);

  useEffect(() => {
    setSelectedToken(_selectedToken);
  }, [_selectedToken]);

  const handleTokenChipClick = () => {
    setOpen(true);
  };

  const handleTokenDialogClose = () => {
    setOpen(false);
  };

  const handleTokenSelected = (token: TokenUpgradeDowngradePair) => {
    setSelectedToken(token);
    onChange(token);
    setOpen(false);
  };

  const tokenSymbol = prioritizeSuperTokens
    ? selectedToken?.superToken.symbol
    : selectedToken?.underlyingToken.symbol;

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
        onClick={handleTokenChipClick}
      ></Chip>
      <TokenDialog
        prioritizeSuperTokens={prioritizeSuperTokens}
        open={open}
        onClose={handleTokenDialogClose}
        onSelect={handleTokenSelected}
      />
    </>
  );
};
