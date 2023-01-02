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
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/system";
import { FC } from "react";
import { useAppSelector } from "../redux/store";
import { useActiveNetworks } from "./ActiveNetworksContext";
import { useAvailableNetworks } from "./AvailableNetworksContext";
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
        {network.name}
      </ListItemText>
      <Switch
        data-cy={`${network.slugName}-toggle`}
        checked={active}
        onChange={onNetworkToggled}
      />
    </MenuItem>
  );
};

export interface NetworkStates {
  [any: number]: boolean;
}

interface NetworkSelectionFilterProps {
  open?: boolean;
  anchorEl?: HTMLElement | null;
  onClose?: () => void;
}

const NetworkSelectionFilter: FC<NetworkSelectionFilterProps> = ({
  open,
  anchorEl,
  onClose,
}) => {
  const theme = useTheme();
  const isBelowSm = useMediaQuery(theme.breakpoints.down("sm"));
  const { availableMainNetworks, availableTestNetworks } =
    useAvailableNetworks();
  const { testnetMode, hideNetwork, unhideNetwork, setTestnetMode } =
    useActiveNetworks();

  const hiddenNetworkChainIds = useAppSelector(
    (state) => state.networkPreferences.hidden
  );

  const onNetworkToggled = (chainId: number) => (active: boolean) =>
    active ? void unhideNetwork(chainId) : void hideNetwork(chainId);

  const onNetworkTypeChange = (_e: unknown, testActive: boolean | null) =>
    void setTestnetMode(!!testActive);

  return (
    <Menu
      open={!!open}
      anchorEl={anchorEl}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      PaperProps={{ sx: { minWidth: 280 }, square: true }}
      sx={{ marginTop: theme.spacing(1.5) }}
    >
      <Collapse
        in={!testnetMode}
        timeout={isBelowSm ? 0 : "auto"}
        unmountOnExit
      >
        {availableMainNetworks.map((network) => (
          <NetworkItem
            data-cy={`${network.slugName}-button`}
            key={network.id}
            network={network}
            active={!hiddenNetworkChainIds.includes(network.id)}
            onChange={onNetworkToggled(network.id)}
          />
        ))}
      </Collapse>

      <Collapse in={testnetMode} timeout={isBelowSm ? 0 : "auto"} unmountOnExit>
        {availableTestNetworks.map((network) => (
          <NetworkItem
            data-cy={`${network.slugName}-button`}
            key={network.id}
            network={network}
            active={!hiddenNetworkChainIds.includes(network.id)}
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
          value={testnetMode}
          onChange={onNetworkTypeChange}
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

export default NetworkSelectionFilter;
