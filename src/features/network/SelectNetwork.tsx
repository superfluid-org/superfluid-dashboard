import {
  Box,
  Button,
  ButtonProps,
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
import { FC, MouseEvent, memo, useState } from "react";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import { useAvailableNetworks } from "./AvailableNetworksContext";
import NetworkIcon from "./NetworkIcon";
import { Network, allNetworks } from "./networks";

const applyPredicates = (
  item: Network,
  predicates: ((item: Network) => boolean)[]
): boolean =>
  predicates.length === 0 || predicates.every((predicate) => predicate(item));

interface NetworkItemProps {
  network: Network;
  selected: boolean;
  onClick: (network: Network) => void;
}

const NetworkItem: FC<NetworkItemProps> = ({ network, selected, onClick }) => (
  <MenuItem
    data-cy={`${network.slugName}-button`}
    key={network.id}
    onClick={() => onClick(network)}
    selected={selected}
    sx={{ height: 50 }}
  >
    <ListItemAvatar sx={{ mr: 1 }}>
      <NetworkIcon network={network} size={24} fontSize={16} />
    </ListItemAvatar>
    {network.name}
  </MenuItem>
);

const CollapsableMenu: FC<{
  predicates?: [(network: Network) => boolean];
  network: Network | undefined | null;
  onNetworkSelected: (network: Network) => void;
}> = ({ predicates = [], network: selectedNetwork, onNetworkSelected }) => {
  const [showTestnets, setShowTestnets] = useState(!!selectedNetwork?.testnet);

  const { availableMainNetworks, availableTestNetworks } =
    useAvailableNetworks();

  const handleShowTestnetsChange = (
    _e: unknown,
    testActive: boolean | null
  ) => {
    if (testActive !== null) setShowTestnets(testActive);
  };

  return (
    <>
      <Collapse in={!showTestnets} timeout="auto" unmountOnExit>
        {availableMainNetworks
          .filter((network) => applyPredicates(network, predicates))
          .map((network) => (
            <NetworkItem
              key={network.id}
              onClick={onNetworkSelected}
              selected={network.id === selectedNetwork?.id}
              network={network}
            />
          ))}
      </Collapse>

      <Collapse in={showTestnets} timeout="auto" unmountOnExit>
        {availableTestNetworks
          .filter((network) => applyPredicates(network, predicates))
          .map((network) => (
            <NetworkItem
              key={network.id}
              onClick={onNetworkSelected}
              selected={network.id === selectedNetwork?.id}
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
    </>
  );
};

const ListedMenu: FC<{
  predicates?: [(network: Network) => boolean];
  network: Network | undefined | null;
  onNetworkSelected: (network: Network) => void;
}> = ({ predicates = [], network: selectedNetwork, onNetworkSelected }) => {
  return (
    <>
      {allNetworks
        .filter((network) => applyPredicates(network, predicates))
        .map((network) => (
          <NetworkItem
            key={network.id}
            onClick={onNetworkSelected}
            selected={network.id === selectedNetwork?.id}
            network={network}
          />
        ))}
    </>
  );
};

const SelectNetwork: FC<{
  network: Network | undefined | null;
  onChange: (network: Network) => void;
  placeholder?: string;
  disabled: boolean;
  predicates?: [(network: Network) => boolean];
  isCollapsable?: boolean;
  isIconButton?: boolean;
  onBlur?: () => void;
  ButtonProps?: ButtonProps;
}> = ({
  network: selectedNetwork,
  onChange,
  placeholder,
  disabled,
  predicates,
  isCollapsable = true,
  isIconButton = true,
  ButtonProps = {},
  onBlur = () => {},
}) => {
  const theme = useTheme();

  const isBelowMd = useMediaQuery(theme.breakpoints.down("md"));

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
      {!isBelowMd || !isIconButton ? (
        <Button
          disabled={disabled}
          data-cy={"top-bar-network-button"}
          variant="outlined"
          color="secondary"
          size="large"
          startIcon={
            selectedNetwork && (
              <NetworkIcon network={selectedNetwork} size={24} fontSize={16} />
            )
          }
          endIcon={<OpenIcon open={open} />}
          onClick={handleOpen}
          sx={{
            justifyContent: "flex-start",
            ".MuiButton-startIcon > *:nth-of-type(1)": { fontSize: "16px" },
            ".MuiButton-endIcon": { marginLeft: "auto" },
          }}
          translate="no"
          {...ButtonProps}
        >
          {selectedNetwork?.name || placeholder}
        </Button>
      ) : (
        <IconButton onClick={handleOpen} size="small">
          {selectedNetwork && (
            <NetworkIcon network={selectedNetwork} size={28} fontSize={16} />
          )}
        </IconButton>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{ sx: { minWidth: 280 }, square: true }}
        sx={{ marginTop: theme.spacing(1.5) }}
        onBlur={onBlur}
      >
        {isCollapsable ? (
          <CollapsableMenu
            network={selectedNetwork}
            onNetworkSelected={onNetworkSelected}
            predicates={predicates}
          />
        ) : (
          <ListedMenu
            network={selectedNetwork}
            onNetworkSelected={onNetworkSelected}
            predicates={predicates}
          />
        )}
      </Menu>
    </>
  );
};

export default memo(SelectNetwork);
