import { Button } from "@mui/material";
import { FC } from "react";
import { Currency } from "../../utils/currencyUtils";
import CountryFlagAvatar from "../Avatar/CountryFlagAvatar";

interface CurrencyMenuItemProps {
  currency: Currency;
  active?: boolean;
  onClick: () => void;
}

const CurrencyMenuItem: FC<CurrencyMenuItemProps> = ({ currency, onClick }) => {
  return (
    <Button
      variant="text"
      color="inherit"
      // Fixed min-width because popover could not calculate it's width and location without this
      sx={{
        minWidth: "74px",
        justifyContent: "flex-start",
      }}
      onClick={onClick}
      startIcon={<CountryFlagAvatar country={currency.country.toLowerCase()} />}
    >
      {currency.code}
    </Button>
  );
};

export default CurrencyMenuItem;
