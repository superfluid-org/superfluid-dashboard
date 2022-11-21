import {
  Box,
  Button,
  Divider,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Popover,
  Typography,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import { useDispatch } from "react-redux";
import CountryFlagAvatar from "../../components/Avatar/CountryFlagAvatar";
import useMenuUtils from "../../hooks/useMenuUtils";
import { Currency } from "../../utils/currencyUtils";
import { applySettings } from "../settings/appSettings.slice";
import { useAppCurrency } from "../settings/appSettingsHooks";

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

interface CurrencyItemProps {
  currency: Currency;
  active?: boolean;
  onClick: () => void;
}
const CurrencyItem: FC<CurrencyItemProps> = ({ currency, onClick }) => {
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

interface CurrencySelectProps {}

const CurrencySelect: FC<CurrencySelectProps> = ({}) => {
  const dispatch = useDispatch();
  const activeCurrency = useAppCurrency();

  const [open, anchorEl, handleOpen, handleClose] = useMenuUtils();

  const theme = useTheme();

  const selectCurrency = (currency: Currency) => () => {
    dispatch(applySettings({ currencyCode: currency.code }));
    handleClose();
  };

  return (
    <>
      <ListItemButton sx={{ borderRadius: "10px" }} onClick={handleOpen}>
        <ListItemAvatar sx={{ ml: 0.25, mr: 2.25 }}>
          <CountryFlagAvatar country={activeCurrency.country} />
        </ListItemAvatar>
        <ListItemText primary={`Currency (${activeCurrency.code})`} />
      </ListItemButton>

      <Popover
        keepMounted
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "left", vertical: "bottom" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        PaperProps={{
          sx: { px: theme.spacing(3), py: theme.spacing(1.5) },
          square: true,
        }}
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
            <CurrencyItem
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
            <CurrencyItem
              key={currency.toString()}
              currency={currency}
              onClick={selectCurrency(currency)}
            />
          ))}
        </Box>
      </Popover>
    </>
  );
};

export default CurrencySelect;
