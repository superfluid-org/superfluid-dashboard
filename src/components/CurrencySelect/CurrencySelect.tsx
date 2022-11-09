import { Button, ListItemAvatar } from "@mui/material";
import { FC, useMemo } from "react";
import useMenuUtils from "../../hooks/useMenuUtils";
import {
  currenciesByCode,
  Currency,
  CurrencyCode,
} from "../../utils/currencyUtils";
import CountryFlagAvatar from "../Avatar/CountryFlagAvatar";
import CurrencySelectMenu from "./CurrencySelectMenu";

interface CurrencySelectProps {
  value?: CurrencyCode;
  onChange: (currencyCode: CurrencyCode) => void;
}

const CurrencySelect: FC<CurrencySelectProps> = ({ value, onChange }) => {
  const [open, anchorEl, handleOpen, handleClose] = useMenuUtils();

  const currency = useMemo(
    () => (value ? currenciesByCode[value] : undefined),
    [value]
  );

  const selectCurrency = (currency: Currency) => {
    onChange(currency.code);
    handleClose();
  };

  return (
    <>
      <Button
        variant="input"
        onClick={handleOpen}
        startIcon={
          currency && (
            <ListItemAvatar sx={{ mr: 0 }}>
              <CountryFlagAvatar country={currency.country} />
            </ListItemAvatar>
          )
        }
      >
        {currency?.code || "Select Currency"}
      </Button>

      <CurrencySelectMenu
        open={open}
        anchorEl={anchorEl}
        onChange={selectCurrency}
        onClose={handleClose}
      />
    </>
  );
};

export default CurrencySelect;
