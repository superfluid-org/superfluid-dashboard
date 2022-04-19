import { Button, Menu, MenuItem } from "@mui/material";
import { memo, useState } from "react";
import { useNetworkContext } from "./NetworkContext";
import { networks } from "./networks";

export default memo(function SelectNetwork() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const { network: selectedNetwork, setNetwork: setSelectedNetwork } =
    useNetworkContext();

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        id="basic-button"
        variant="outlined"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        {selectedNetwork ? selectedNetwork.displayName : "Select network"}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        {networks.map((n) => (
          <MenuItem
            key={n.chainId}
            onClick={() => {
              handleClose();
              setSelectedNetwork(n.chainId);
            }}
            selected={n.chainId === selectedNetwork.chainId}
          >
            {n.displayName}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
});
