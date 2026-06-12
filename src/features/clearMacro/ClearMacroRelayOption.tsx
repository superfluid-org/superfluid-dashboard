import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { Stack, Switch, Typography } from "@mui/material";
import { FC } from "react";
import TooltipWithIcon from "../common/TooltipWithIcon";
import { Network } from "../network/networks";
import { ClearMacroActionKind } from "./dashboardClearMacro";
import { useClearMacroEligibility } from "./useClearMacroEligibility";

interface ClearMacroRelayOptionProps {
  /** The macro action this form's primary button maps to; `undefined` = not eligible. */
  actionKind: ClearMacroActionKind | undefined;
  network: Network;
}

/**
 * The form-level pre-click signal for the Clear Macro relay path: shows next to the
 * primary `TransactionButton` of macro-eligible forms only, and flips the persisted
 * preference. Renders nothing when the relay cannot engage (network/wallet/action).
 */
export const ClearMacroRelayOption: FC<ClearMacroRelayOptionProps> = ({
  actionKind,
  network,
}) => {
  const { isEligible, isRelayEnabled, setRelayEnabled } =
    useClearMacroEligibility(actionKind, network);

  if (!isEligible) return null;

  return (
    <Stack
      data-cy="clear-macro-relay-option"
      direction="row"
      alignItems="center"
      gap={0.5}
    >
      <BoltRoundedIcon fontSize="small" color="primary" />
      <Typography variant="body2" sx={{ flex: 1 }} translate="yes">
        Gasless via Clear Macro relay
      </Typography>
      <TooltipWithIcon title="Instead of a regular transaction, you sign one human-readable message and a relay service submits the transaction and pays the gas." />
      <Switch
        data-cy="clear-macro-relay-switch"
        size="small"
        checked={isRelayEnabled}
        onChange={(_event, checked) => setRelayEnabled(checked)}
        inputProps={{ "aria-label": "Toggle gasless Clear Macro relay" }}
      />
    </Stack>
  );
};
