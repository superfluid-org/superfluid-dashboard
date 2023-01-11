import { Button, ListItemAvatar, PopoverProps } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
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
  PopoverProps?: Partial<PopoverProps>;
}

const CurrencySelect: FC<CurrencySelectProps> = ({
  value,
  onChange,
  PopoverProps = {},
}) => {
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
        endIcon={
          <ArrowDropDownIcon
            sx={{
              mr: -1,
              color: "action.active",
              width: "24px",
              height: "24px",
            }}
          />
        }
      >
        {currency?.code || "Select Currency"}
      </Button>

      <CurrencySelectMenu
        open={open}
        anchorEl={anchorEl}
        onChange={selectCurrency}
        onClose={handleClose}
        PopoverProps={PopoverProps}
      />
    </>
  );
};

export default CurrencySelect;
