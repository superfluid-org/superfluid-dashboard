import { Button, Menu, MenuItem } from "@mui/material";
import { FC, useState } from "react";
import { useNetworkContext } from "../contexts/NetworkContext";
import { networks } from "../networks";

export default function SelectNetwork() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const { network, setNetwork } = useNetworkContext();

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
        {network ? network.displayName : "Select network"}
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
        {networks.map((network) => (
          <MenuItem
            key={network.chainId}
            onClick={() => {
              handleClose();
              setNetwork(network.chainId);
            }}
            selected={network === network}
          >
            {network.displayName}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
