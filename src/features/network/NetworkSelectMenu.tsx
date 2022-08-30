import {
  Box,
  Collapse,
  ListItemAvatar,
  Menu,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from "@mui/material";
import { FC, memo, useMemo, useState } from "react";
import NetworkIcon from "./NetworkIcon";
import { Network } from "./networks";

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

interface NetworkSelectMenuProps {
  networkSelection: Array<Network>;
  anchorEl?: Element | null;
  selectedNetworkId?: number;
  initialShowTestNetworks?: boolean;
  onChange: (selectedNetwork: Network) => void;
  onClose: () => void;
}

const NetworkSelectMenu: FC<NetworkSelectMenuProps> = ({
  networkSelection,
  anchorEl,
  selectedNetworkId,
  initialShowTestNetworks = false,
  onChange,
  onClose,
}) => {
  const theme = useTheme();

  const [showTestnets, setShowTestnets] = useState(initialShowTestNetworks);

  const onNetworkSelected = (selectedNetwork: Network) => () =>
    onChange(selectedNetwork);

  const handleShowTestnetsChange = (_: unknown, testActive: boolean | null) => {
    if (testActive !== null) setShowTestnets(testActive);
  };

  const open = Boolean(anchorEl);

  const { mainNetworks, testNetworks } = useMemo(
    () => ({
      mainNetworks: networkSelection.filter((network) => !network.testnet),
      testNetworks: networkSelection.filter((network) => !!network.testnet),
    }),
    [networkSelection]
  );

  return (
    <Menu
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      PaperProps={{ sx: { minWidth: 280 }, square: true }}
      sx={{ marginTop: theme.spacing(1.5) }}
    >
      <Collapse in={!showTestnets} timeout="auto" unmountOnExit>
        {mainNetworks.map((network) => (
          <NetworkItem
            key={network.id}
            onClick={onNetworkSelected(network)}
            selected={network.id === selectedNetworkId}
            network={network}
          />
        ))}
      </Collapse>

      <Collapse in={showTestnets} timeout="auto" unmountOnExit>
        {testNetworks.map((network) => (
          <NetworkItem
            key={network.id}
            onClick={onNetworkSelected(network)}
            selected={network.id === selectedNetworkId}
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
          <ToggleButton data-cy={"mainnets-button"} value={false}>
            Mainnets
          </ToggleButton>
          <ToggleButton data-cy={"testnets-button"} value={true}>
            Testnets
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Menu>
  );
};

export default memo(NetworkSelectMenu);
