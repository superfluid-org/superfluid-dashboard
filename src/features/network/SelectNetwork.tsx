import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  Box,
  Button,
  Collapse,
  ListItemAvatar,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  styled,
  useTheme,
} from "@mui/material";
import { FC, memo, MouseEvent, useState } from "react";
import { useAccount, useNetwork } from "wagmi";
import { useExpectedNetwork } from "./ExpectedNetworkContext";
import NetworkIcon from "./NetworkIcon";
import { mainNetworks, Network, testNetworks } from "./networks";

interface OpenIconProps {
  open: boolean;
}

export const OpenIcon = styled(KeyboardArrowDownIcon)<OpenIconProps>(
  ({ theme, open }) => ({
    transform: `rotate(${open ? 180 : 0}deg)`,
    transition: theme.transitions.create("transform", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.short,
    }),
  })
);

interface NetworkItemProps {
  network: Network;
  selected: boolean;
  onClick: () => void;
}

const NetworkItem: FC<NetworkItemProps> = ({ network, selected, onClick }) => (
  <MenuItem
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
  
  const { data: account } = useAccount();
  const { switchNetwork } = useNetwork();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [showTestnets, setShowTestnets] = useState(false);

  const open = Boolean(anchorEl);

  const { network: selectedNetwork, setExpectedNetwork: setSelectedNetwork } =
    useExpectedNetwork();

  const handleOpen = (event: MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);

  const handleClose = () => setAnchorEl(null);

  const onNetworkSelected = (chainId: number) => () => {
    handleClose();
    setSelectedNetwork(chainId);

    if (account && switchNetwork) {
      switchNetwork(chainId);
    }
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
        endIcon={<OpenIcon open={open} />}
        onClick={handleOpen}
        sx={{ ".MuiButton-startIcon > *:nth-of-type(1)": { fontSize: "16px" } }}
      >
        {selectedNetwork.name}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{ sx: { minWidth: 280 }, square: true, elevation: 2 }}
        sx={{ marginTop: theme.spacing(1.5) }}
      >
        <Collapse in={!showTestnets} timeout="auto" unmountOnExit>
          {mainNetworks.map((network) => (
            <NetworkItem
              key={network.id}
              onClick={onNetworkSelected(network.id)}
              selected={network.id === selectedNetwork.id}
              network={network}
            />
          ))}
        </Collapse>

        <Collapse in={showTestnets} timeout="auto" unmountOnExit>
          {testNetworks.map((network) => (
            <NetworkItem
              key={network.id}
              onClick={onNetworkSelected(network.id)}
              selected={network.id === selectedNetwork.id}
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
