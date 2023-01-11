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
import CountryFlagAvatar from "../Avatar/CountryFlagAvatar";
import useMenuUtils from "../../hooks/useMenuUtils";
import { Currency } from "../../utils/currencyUtils";
import { applySettings } from "../../features/settings/appSettings.slice";
import { useAppCurrency } from "../../features/settings/appSettingsHooks";
import CurrencySelectMenu from "./CurrencySelectMenu";

interface AppCurrencySelectProps {}

const AppCurrencySelect: FC<AppCurrencySelectProps> = ({}) => {
  const dispatch = useDispatch();
  const activeCurrency = useAppCurrency();

  const [open, anchorEl, handleOpen, handleClose] = useMenuUtils();

  const selectCurrency = (currency: Currency) => {
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

      <CurrencySelectMenu
        open={open}
        anchorEl={anchorEl}
        onChange={selectCurrency}
        onClose={handleClose}
      />
    </>
  );
};

export default AppCurrencySelect;
