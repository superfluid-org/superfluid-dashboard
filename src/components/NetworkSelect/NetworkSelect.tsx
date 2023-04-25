import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { FC, useState } from "react";
import { allNetworks, Network } from "../../features/network/networks";
import NetworkIcon from "../../features/network/NetworkIcon";
import { colors } from "@mui/material";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
};

type NetworkSelectProps = {
  selectedNetworks: Network[];
  onSelect: (network: Network[]) => void;
};

const NetworkSelect: FC<NetworkSelectProps> = ({
  selectedNetworks,
  onSelect,
}) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;

    const selectedNetworks = allNetworks.filter((network) =>
      value.includes(network.name)
    );

    onSelect(selectedNetworks);
  };

  return (
    <FormControl fullWidth>
      <InputLabel
        id="demo-multiple-checkbox-label"
        sx={{
          px: 4,
          background: "white",
          color: colors.grey[500],
          fontWeight: 400,
          m: 0,
          p: 0,
          '&[data-shrink="true"]': {
            px: 1,
          },
        }}
      >
        Networks (optional)
      </InputLabel>
      <Select
        id="network-select"
        multiple
        value={selectedNetworks.map((network) => network.name)}
        onChange={handleChange}
        input={<OutlinedInput placeholder="Select Networks" />}
        renderValue={(selected) => selected.join(", ")}
        MenuProps={MenuProps}
      >
        {allNetworks.map((network) => (
          <MenuItem key={`${network.id}`} value={network.name}>
            <Checkbox
              checked={Boolean(
                selectedNetworks.find((n) => n.id === network.id)
              )}
            />
            <ListItemText primary={network.name} />
            <NetworkIcon network={network} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default NetworkSelect;
