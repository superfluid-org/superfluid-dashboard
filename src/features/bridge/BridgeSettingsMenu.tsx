import { Order, Orders } from "@lifi/sdk";
import {
  Box,
  FormLabel,
  IconButton,
  Input,
  Menu,
  MenuItem,
  Popover,
  Popper,
  Select,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { FC, MouseEvent, useState } from "react";
import TooltipIcon from "../common/TooltipIcon";

interface BridgeSettingsMenuProps {
  anchorEl: Element | null;
  onClose: () => void;
}

const BridgeSettingsMenu: FC<BridgeSettingsMenuProps> = ({
  anchorEl,
  onClose,
}) => {
  const theme = useTheme();
  const open = Boolean(anchorEl);

  const [bridgePrioritization, setBridgePrioritization] =
    useState<Order>("RECOMMENDED");

  const [slippage, setSlippage] = useState(3);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      PaperProps={{
        sx: { maxWidth: "520px", width: "100%", p: 3.5 },
        square: true,
      }}
      sx={{ marginTop: theme.spacing(1.5) }}
    >
      <Stack direction="row" alignItems="center" gap={2}>
        <Box flex={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mr: 0.75 }}
          >
            <FormLabel>Bridge Prioritization</FormLabel>
            <TooltipIcon title="Bridge Prioritization" />
          </Stack>

          <Select
            fullWidth
            value={bridgePrioritization}
            sx={{ textTransform: "capitalize" }}
          >
            {Orders.map((order) => (
              <MenuItem
                key={order}
                value={order}
                sx={{ textTransform: "capitalize" }}
              >
                {order.toLowerCase()}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box flex={1}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mr: 0.75 }}
          >
            <FormLabel>Slippage Tolerance</FormLabel>
            <TooltipIcon title="Slippage Tolerance" />
          </Stack>
          <TextField
            fullWidth
            value={slippage}
            type="number"
            InputProps={{ inputProps: { min: 0, max: 100 }, endAdornment: "%" }}
            onChange={(e: any) => setSlippage(Number(e.target.value))}
          />
        </Box>
      </Stack>
    </Popover>
  );
};

export default BridgeSettingsMenu;
