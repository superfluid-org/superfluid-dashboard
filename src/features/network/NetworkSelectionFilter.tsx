import {
  Box,
  Collapse,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useTheme } from "@mui/system";
import { FC } from "react";
import NetworkIcon from "./NetworkIcon";
import { Network, networks } from "./networks";

export const buildNetworkStates = (
  networkList: Array<Network>,
  defaultActive: boolean
) =>
  networkList.reduce(
    (activeStates, network) => ({
      ...activeStates,
      [network.id]: defaultActive,
    }),
    {}
  );

interface NetworkItemProps {
  network: Network;
  active: boolean;
  onChange: (active: boolean) => void;
}

const NetworkItem: FC<NetworkItemProps> = ({ network, active, onChange }) => {
  const onNetworkToggled = (_e: unknown, checked: boolean) => onChange(checked);

  return (
    <MenuItem>
      <ListItemAvatar sx={{ mr: 1 }}>
        <NetworkIcon size={24} fontSize={16} network={network} />
      </ListItemAvatar>
      <ListItemText primaryTypographyProps={{ variant: "menuItem" }}>
        {network.name}
      </ListItemText>
      <Switch data-cy={`${network.slugName}-toggle`} checked={active} onChange={onNetworkToggled} />
    </MenuItem>
  );
};

export interface NetworkStates {
  [any: number]: boolean;
}

interface NetworkSelectionFilterProps {
  open?: boolean;
  anchorEl?: HTMLElement | null;
  networkStates: NetworkStates;
  showTestnets?: boolean;
  onNetworkChange: (chainId: number, active: boolean) => void;
  onTestnetsChange: (showTestnets: boolean) => void;
  onClose?: () => void;
}

const NetworkSelectionFilter: FC<NetworkSelectionFilterProps> = ({
  open,
  anchorEl,
  networkStates,
  showTestnets,
  onNetworkChange,
  onTestnetsChange,
  onClose,
}) => {
  const theme = useTheme();

  const onNetworkTypeChange = (_e: unknown, testActive: boolean | null) => {
    if (testActive !== null) onTestnetsChange(testActive);
  };

  const onNetworkToggled = (chainId: number) => (active: boolean) =>
    onNetworkChange(chainId, active);

  const mainnets = networks.filter((network) => !network.testnet);
  const testnets = networks.filter((network) => network.testnet);

  return (
    <Menu
      open={!!open}
      anchorEl={anchorEl}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      PaperProps={{ sx: { minWidth: 280 }, square: true, elevation: 2 }}
      sx={{ marginTop: theme.spacing(1.5) }}
    >
      <Collapse in={!showTestnets} timeout="auto" unmountOnExit>
        {mainnets.map((network) => (
          <NetworkItem
            data-cy={`${network.slugName}-button`}
            key={network.id}
            network={network}
            active={networkStates[network.id]}
            onChange={onNetworkToggled(network.id)}
          />
        ))}
      </Collapse>

      <Collapse in={showTestnets} timeout="auto" unmountOnExit>
        {testnets.map((network) => (
          <NetworkItem
            data-cy={`${network.slugName}-button`}
            key={network.id}
            network={network}
            active={networkStates[network.id]}
            onChange={onNetworkToggled(network.id)}
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
          onChange={onNetworkTypeChange}
        >
          <ToggleButton data-cy={"mainnets-button"} value={false}>Mainnets</ToggleButton>
          <ToggleButton data-cy={"testnets-button"} value={true}>Testnets</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Menu>
  );
};

export default NetworkSelectionFilter;
