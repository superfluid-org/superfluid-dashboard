import {
  Box,
  Button,
  Divider,
  ListSubheader,
  Popover,
  Typography,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import { CircleFlag } from "react-circle-flags";
import CountryFlagAvatar from "../../components/Avatar/CountryFlagAvatar";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import useMenuUtils from "../../hooks/useMenuUtils";
import { Currency } from "../../utils/currencyUtils";
import { useAppSettingsContext } from "../settings/AppSettingsContext";

const POPULAR_CURRENCIES = [
  Currency.USD,
  Currency.EUR,
  Currency.AUD,
  Currency.BRL,
];
const FIAT_CURRENCIES = [
  Currency.CAD,
  Currency.CHF,
  Currency.CNY,
  Currency.GBP,
  Currency.HKD,
  Currency.INR,
  Currency.JPY,
  Currency.KRW,
  Currency.MXN,
  Currency.NOK,
  Currency.RUB,
  Currency.SEK,
  Currency.TRY,
  Currency.ZAR,
];

interface CurrencyItemProps {
  currency: Currency;
  onClick: () => void;
}
const CurrencyItem: FC<CurrencyItemProps> = ({ currency, onClick }) => {
  return (
    <Button
      variant="text"
      color="inherit"
      // Fixed min-width because popover could not calculate it's width and location without this
      sx={{ minWidth: "74px", justifyContent: "flex-start" }}
      onClick={onClick}
      startIcon={
        <CircleFlag countryCode={currency.country.toLowerCase()} height="24" />
      }
    >
      <div>{currency.code}</div>
    </Button>
  );
};

interface CurrencySelectProps {}

const CurrencySelect: FC<CurrencySelectProps> = ({}) => {
  const { currency: activeCurrency, setCurrency } = useAppSettingsContext();

  const [open, anchorEl, handleOpen, handleClose] = useMenuUtils();

  const theme = useTheme();

  const selectCurrency = (currency: Currency) => () => setCurrency(currency);

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        size="large"
        startIcon={<CountryFlagAvatar country={activeCurrency.country} />}
        endIcon={<OpenIcon open={open} />}
        onClick={handleOpen}
      >
        <Typography variant="button" sx={{ width: "30px" }}>
          {activeCurrency.code}
        </Typography>
      </Button>
      {open && (
        <Popover
          anchorEl={anchorEl}
          open={true}
          onClose={handleClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: { px: theme.spacing(3), py: theme.spacing(1.5) },
            square: true,
          }}
          sx={{ marginTop: theme.spacing(1.5) }}
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
      )}
    </>
  );
};

export default CurrencySelect;
