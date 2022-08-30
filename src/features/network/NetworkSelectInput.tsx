import { Button, ButtonProps, useMediaQuery, useTheme } from "@mui/material";
import { FC, MouseEvent, useState } from "react";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import NetworkIcon from "./NetworkIcon";
import { Network, networks } from "./networks";
import NetworkSelectMenu from "./NetworkSelectMenu";

interface NetworkSelectInputProps {
  networkSelection: Array<Network>;
  selectedNetwork?: Network;
  onChange: (selectedNetwork: Network) => void;
  ButtonProps?: Partial<ButtonProps>;
}

const NetworkSelectInput: FC<NetworkSelectInputProps> = ({
  networkSelection,
  selectedNetwork,
  onChange,
  ButtonProps = {},
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const onNetworkSelected = (network: Network) => {
    onChange(network);
    handleClose();
  };

  return (
    <>
      <Button
        variant="input"
        color="secondary"
        startIcon={
          selectedNetwork && (
            <NetworkIcon network={selectedNetwork} size={24} fontSize={16} />
          )
        }
        endIcon={<OpenIcon open={open} />}
        onClick={handleOpen}
        {...ButtonProps}
      >
        {selectedNetwork ? (
          <span translate="no">{selectedNetwork.name}</span>
        ) : (
          <span>Select a network</span>
        )}
      </Button>

      <NetworkSelectMenu
        networkSelection={networkSelection}
        anchorEl={anchorEl}
        selectedNetworkId={selectedNetwork?.id}
        onChange={onNetworkSelected}
        onClose={handleClose}
      />
    </>
  );
};

export default NetworkSelectInput;
