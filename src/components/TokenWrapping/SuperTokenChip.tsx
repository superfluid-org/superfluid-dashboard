import {FC, useState} from "react";
import {TokenUpgradeDowngradePair} from "../../redux/endpoints/adHocSubgraphEndpoints";
import {Chip, Stack} from "@mui/material";
import TokenIcon from "../TokenIcon";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {SuperTokenDialog} from "./SuperTokenDialog";

export const SuperTokenChip: FC<{
    _selectedToken: TokenUpgradeDowngradePair | null;
    onChange: (tokenUpgrade: TokenUpgradeDowngradePair | null) => void;
}> = ({onChange, _selectedToken}) => {
    const [open, setOpen] = useState(false);

    const [selectedToken, setSelectedToken] =
        useState<TokenUpgradeDowngradePair | null>(_selectedToken);

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
                        <TokenIcon tokenSymbol={selectedToken.superToken.symbol}/>
                    ) : (
                        <></>
                    )
                }
                label={
                    <>
                        <Stack direction="row" alignItems="center">
                            {selectedToken?.superToken.symbol ?? "Select a token"}{" "}
                            <ExpandMoreIcon/>
                        </Stack>
                    </>
                }
                onClick={handleTokenChipClick}
            ></Chip>
            <SuperTokenDialog
                open={open}
                handleClose={handleTokenDialogClose}
                handleSelected={handleTokenSelected}
            />
        </>
    );
};