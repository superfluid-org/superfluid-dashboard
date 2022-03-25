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
    <div>
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
        {networks.map((x) => (
          <MenuItem
            key={x.chainId}
            onClick={() => {
              handleClose();
              setNetwork(x);
            }}
            selected={x === network}
          >
            {x.displayName}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
