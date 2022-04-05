import { FC, useEffect, useState } from "react";
import { TokenUpgradeDowngradePair } from "../../redux/endpoints/adHocSubgraphEndpoints";
import { Chip, Stack } from "@mui/material";
import TokenIcon from "../TokenIcon";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import UnderlyingTokenDialog from "./UnderlyingTokenDialog";

export const UnderlyingTokenChip: FC<{
  _selectedToken?: TokenUpgradeDowngradePair;
  onChange: (tokenPair: TokenUpgradeDowngradePair | undefined) => void;
}> = ({ onChange, _selectedToken }) => {
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

  return (
    <>
      <Chip
        icon={
          selectedToken ? (
            <TokenIcon tokenSymbol={selectedToken.underlyingToken.symbol} />
          ) : (
            <></>
          )
        }
        label={
          <>
            <Stack direction="row" alignItems="center">
              {selectedToken?.underlyingToken.symbol ?? "Select a token"}{" "}
              <ExpandMoreIcon />
            </Stack>
          </>
        }
        onClick={handleTokenChipClick}
      ></Chip>
      <UnderlyingTokenDialog
        open={open}
        handleClose={handleTokenDialogClose}
        handleSelected={handleTokenSelected}
      />
    </>
  );
};
