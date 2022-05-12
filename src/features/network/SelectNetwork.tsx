import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Divider,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTheme } from "@mui/system";
import { FC, memo, MouseEvent, useState } from "react";
import { useNetworkContext } from "./NetworkContext";
import NetworkIcon from "./NetworkIcon";
import { mainNetworks, Network, testNetworks } from "./networks";

interface NetworkItemProps {
  network: Network;
  selected: boolean;
  onClick: () => void;
}

const NetworkItem: FC<NetworkItemProps> = ({ network, selected, onClick }) => (
  <MenuItem
    key={network.chainId}
    onClick={onClick}
    selected={selected}
    sx={{ height: 50 }}
  >
    <ListItemAvatar sx={{ mr: 1 }}>
      <NetworkIcon network={network} size={24} fontSize={16} />
    </ListItemAvatar>
    <ListItemText>{network.displayName}</ListItemText>
  </MenuItem>
);

export default memo(function SelectNetwork() {
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showTestnets, setShowTestnets] = useState(false);

  const open = Boolean(anchorEl);

  const { network: selectedNetwork, setNetwork: setSelectedNetwork } =
    useNetworkContext();

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const onNetworkSelected = (chainId: number) => () => {
    handleClose();
    setSelectedNetwork(chainId);
  };

  const handleShowTestnetsChange = (
    _e: unknown,
    testActive: boolean | null
  ) => {
    if (testActive !== null) setShowTestnets(testActive);
  };

  return (
    <>
      <Button
        variant="outlined"
        color="secondary"
        size="large"
        startIcon={
          <NetworkIcon network={selectedNetwork} size={24} fontSize={16} />
        }
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleOpen}
        sx={{ ".MuiButton-startIcon > *:nth-of-type(1)": { fontSize: "16px" } }}
      >
        {selectedNetwork.displayName}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{ sx: { minWidth: 280 } }}
        sx={{ marginTop: theme.spacing(1.5) }}
      >
        <Collapse in={!showTestnets} timeout="auto" unmountOnExit>
          {mainNetworks.map((network) => (
            <NetworkItem
              key={network.chainId}
              onClick={onNetworkSelected(network.chainId)}
              selected={network.chainId === selectedNetwork.chainId}
              network={network}
            />
          ))}
        </Collapse>

        <Collapse in={showTestnets} timeout="auto" unmountOnExit>
          {testNetworks.map((network) => (
            <NetworkItem
              key={network.chainId}
              onClick={onNetworkSelected(network.chainId)}
              selected={network.chainId === selectedNetwork.chainId}
              network={network}
            />
          ))}
        </Collapse>

        <Box sx={{ margin: "6px 16px" }}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            color="primary"
            value={showTestnets}
            onChange={handleShowTestnetsChange}
          >
            <ToggleButton value={false}>Mainnets</ToggleButton>
            <ToggleButton value={true}>Testnets</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Menu>
    </>
  );
});
