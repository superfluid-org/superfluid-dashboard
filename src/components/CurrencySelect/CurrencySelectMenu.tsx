import {
  Box,
  Divider,
  Popover,
  PopoverProps,
  Typography,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import { Currency } from "../../utils/currencyUtils";
import CurrencyMenuItem from "./CurrencyMenuItem";

const POPULAR_CURRENCIES = [
  Currency.USD,
  Currency.EUR,
  Currency.CNY,
  Currency.AUD,
];

const FIAT_CURRENCIES = [
  Currency.CAD,
  Currency.CHF,
  Currency.BRL,
  Currency.GBP,
  Currency.HKD,
  Currency.INR,
  Currency.JPY,
  Currency.KRW,
  Currency.MXN,
  Currency.NOK,
  Currency.RUB,
  Currency.SEK,
];

interface CurrencySelectMenuProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onChange: (currency: Currency) => void;
  onClose: () => void;
  PopoverProps?: Partial<PopoverProps>;
}

const CurrencySelectMenu: FC<CurrencySelectMenuProps> = ({
  open,
  anchorEl,
  onChange,
  onClose,
  PopoverProps = {},
}) => {
  const theme = useTheme();

  const selectCurrency = (currency: Currency) => () => onChange(currency);

  return (
    <Popover
      keepMounted
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      transformOrigin={{ horizontal: "left", vertical: "bottom" }}
      anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
      PaperProps={{
        sx: { px: theme.spacing(3), py: theme.spacing(1.5) },
        square: true,
      }}
      {...PopoverProps}
    >
      <Typography color="text.secondary">Popular</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
        }}
      >
        {POPULAR_CURRENCIES.map((currency) => (
          <CurrencyMenuItem
            key={currency.toString()}
            currency={currency}
            onClick={selectCurrency(currency)}
          />
        ))}
      </Box>
      <Divider sx={{ my: 1 }} />
      <Typography color="text.secondary">Fiat</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
        }}
      >
        {FIAT_CURRENCIES.map((currency) => (
          <CurrencyMenuItem
            key={currency.toString()}
            currency={currency}
            onClick={selectCurrency(currency)}
          />
        ))}
      </Box>
    </Popover>
  );
};

export default CurrencySelectMenu;
