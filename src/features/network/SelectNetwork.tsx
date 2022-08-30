import {
  Box,
  Button,
  Collapse,
  IconButton,
  ListItemAvatar,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { FC, memo, MouseEvent, useState } from "react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import { useExpectedNetwork } from "./ExpectedNetworkContext";
import NetworkIcon from "./NetworkIcon";
import { mainNetworks, Network, networks, testNetworks } from "./networks";
import SelectNetworkMenu from "./NetworkSelectMenu";

interface NetworkItemProps {
  network: Network;
  selected: boolean;
  onClick: () => void;
}

const NetworkItem: FC<NetworkItemProps> = ({ network, selected, onClick }) => (
  <MenuItem
    data-cy={`${network.slugName}-button`}
    key={network.id}
    onClick={onClick}
    selected={selected}
    sx={{ height: 50 }}
  >
    <ListItemAvatar sx={{ mr: 1 }}>
      <NetworkIcon network={network} size={24} fontSize={16} />
    </ListItemAvatar>
    {network.name}
  </MenuItem>
);

export default memo(function SelectNetwork() {
  const theme = useTheme();
  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

  const { address: accountAddress } = useAccount();
  const { switchNetwork } = useSwitchNetwork();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const open = Boolean(anchorEl);

  const { network: selectedNetwork, setExpectedNetwork: setSelectedNetwork } =
    useExpectedNetwork();

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const onNetworkSelected = (network: Network) => {
    handleClose();
    setSelectedNetwork(network.id);

    if (accountAddress && switchNetwork) {
      switchNetwork(network.id);
    }
  };

  return (
    <>
      {!isBelowMd ? (
        <Button
          data-cy={"top-bar-network-button"}
          variant="outlined"
          color="secondary"
          size="large"
          startIcon={
            <NetworkIcon network={selectedNetwork} size={24} fontSize={16} />
          }
          endIcon={<OpenIcon open={open} />}
          onClick={handleOpen}
          sx={{
            ".MuiButton-startIcon > *:nth-of-type(1)": { fontSize: "16px" },
          }}
          translate="no"
        >
          {selectedNetwork.name}
        </Button>
      ) : (
        <IconButton onClick={handleOpen}>
          <NetworkIcon network={selectedNetwork} size={30} fontSize={16} />
        </IconButton>
      )}

      <SelectNetworkMenu
        networkSelection={networks}
        anchorEl={anchorEl}
        selectedNetworkId={selectedNetwork.id}
        onChange={onNetworkSelected}
        onClose={handleClose}
      />
    </>
  );
});
