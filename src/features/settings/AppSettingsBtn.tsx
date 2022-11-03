import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import {
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  Popover,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import useMenuUtils from "../../hooks/useMenuUtils";
import ThemeChanger from "../theme/ThemeChanger";
import CurrencySelect from "../tokenPrice/CurrencySelect";

interface AppSettingsBtnProps {}

const AppSettingsBtn: FC<AppSettingsBtnProps> = ({}) => {
  const theme = useTheme();
  const [open, anchorEl, handleOpen, handleClose] = useMenuUtils();

  return (
    <>
      <ListItemButton sx={{ borderRadius: "10px" }} onClick={handleOpen}>
        <ListItemIcon sx={{ ml: 0.25, mr: 2.25 }}>
          <SettingsRoundedIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText primary="Settings" />
      </ListItemButton>
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "left", vertical: "bottom" }}
        anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
        PaperProps={{
          sx: { minWidth: 228 },
          square: true,
        }}
      >
        <ThemeChanger />
        <CurrencySelect />
      </Popover>
    </>
  );
};

export default AppSettingsBtn;
