import {
  Avatar,
  Box,
  Collapse,
  Divider,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  MenuList,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/system";
import { FC, useState } from "react";
import NetworkIcon from "./NetworkIcon";
import { Network, networks } from "./networks";

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
        {network.displayName}
      </ListItemText>
      <Switch checked={active} onChange={onNetworkToggled} />
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

  const mainnets = networks.filter((network) => !network.isTestnet);
  const testnets = networks.filter((network) => network.isTestnet);

  return (
    <Menu
      open={!!open}
      anchorEl={anchorEl}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      PaperProps={{ sx: { minWidth: 280 } }}
      sx={{ marginTop: theme.spacing(1.5) }}
    >
      <Collapse in={!showTestnets} timeout="auto" unmountOnExit>
        {mainnets.map((network) => (
          <NetworkItem
            key={network.chainId}
            network={network}
            active={networkStates[network.chainId]}
            onChange={onNetworkToggled(network.chainId)}
          />
        ))}
      </Collapse>

      <Collapse in={showTestnets} timeout="auto" unmountOnExit>
        {testnets.map((network) => (
          <NetworkItem
            key={network.chainId}
            network={network}
            active={networkStates[network.chainId]}
            onChange={onNetworkToggled(network.chainId)}
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
          <ToggleButton value={false}>Mainnets</ToggleButton>
          <ToggleButton value={true}>Testnets</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Menu>
  );
};

export default NetworkSelectionFilter;
