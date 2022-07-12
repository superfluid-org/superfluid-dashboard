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
import { useAccount, useNetwork } from "wagmi";
import OpenIcon from "../../components/OpenIcon/OpenIcon";
import { useExpectedNetwork } from "./ExpectedNetworkContext";
import NetworkIcon from "./NetworkIcon";
import { mainNetworks, Network, testNetworks } from "./networks";

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

  const { data: account } = useAccount();
  const accountAddress = account?.address;

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

    if (accountAddress && switchNetwork) {
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
        >
          {selectedNetwork.name}
        </Button>
      ) : (
        <IconButton onClick={handleOpen}>
          <NetworkIcon network={selectedNetwork} size={30} fontSize={16} />
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
            <ToggleButton data-cy={"mainnets-button"} value={false}>
              Mainnets
            </ToggleButton>
            <ToggleButton data-cy={"testnets-button"} value={true}>
              Testnets
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Menu>
    </>
  );
});
