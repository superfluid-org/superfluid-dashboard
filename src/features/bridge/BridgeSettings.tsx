import { ButtonProps, IconButton, IconButtonProps } from "@mui/material";
import { FC, MouseEvent, useState } from "react";
import BridgeSettingsMenu from "./BridgeSettingsMenu";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
interface BridgeSettingsProps {
  ButtonProps?: Partial<IconButtonProps>;
}

const BridgeSettings: FC<BridgeSettingsProps> = ({ ButtonProps }) => {
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleOpen} {...ButtonProps}>
        <SettingsRoundedIcon />
      </IconButton>
      <BridgeSettingsMenu anchorEl={anchorEl} onClose={handleClose} />
    </>
  );
};

export default BridgeSettings;
