import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import { FC, useState } from "react";
import {
  allNetworks,
  findNetworkOrThrow,
  Network,
} from "../../features/network/networks";
import NetworkIcon from "../../features/network/NetworkIcon";
import { Stack, colors } from "@mui/material";

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
  readonly?: boolean;
};

const NetworkSelect: FC<NetworkSelectProps> = ({
  selectedNetworks,
  onSelect,
  readonly,
}) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    if (readonly) return;

    const {
      target: { value },
    } = event;

    const selectedNetworks = allNetworks.filter((network) =>
      value.includes(network.slugName)
    );

    onSelect(selectedNetworks);
  };

  return (
    <FormControl fullWidth>
      <InputLabel
        sx={{
          px: 4,
          background: "white",
          color: colors.grey[500],
          fontWeight: 400,
          m: 0,
          p: 0,
          '&[data-shrink="true"]': {
            display: "none",
          },
        }}
      >
        Networks (optional)
      </InputLabel>
      <Select
        id="network-select"
        multiple
        disabled={readonly}
        value={selectedNetworks.map((network) => network.slugName)}
        onChange={handleChange}
        input={<OutlinedInput placeholder="Select Networks" />}
        renderValue={(selected) => (
          <Stack direction="row" gap={1}>
            {selected.map((n, i) => {
              const network = findNetworkOrThrow(allNetworks, n);
              return (
                <Stack
                  key={`MuiStack-${network.name}`}
                  direction="row"
                  alignItems="center"
                  gap={0.5}
                >
                  <NetworkIcon size={20} network={network} />
                  {network.name}
                  {i !== selected.length - 1 && ","}
                </Stack>
              );
            })}
          </Stack>
        )}
        MenuProps={MenuProps}
      >
        {allNetworks
          .filter(({ testnet }) => !testnet)
          .map((network) => (
            <MenuItem
              key={`${network.id}`}
              value={network.slugName}
              sx={{ justifyContent: "space-between" }}
            >
              <Stack direction="row" gap={1} alignItems="center">
                <NetworkIcon size={20} network={network} />
                <ListItemText primary={network.name} />
              </Stack>

              <Checkbox
                checked={Boolean(
                  selectedNetworks.find((n) => n.id === network.id)
                )}
              />
            </MenuItem>
          ))}
      </Select>
    </FormControl>
  );
};

export default NetworkSelect;
