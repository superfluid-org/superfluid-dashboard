import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import { Paper, Switch, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
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
 *
 * Visually it's an outlined "perk" strip that only takes on the primary accent (border,
 * faint fill, bolt) while enabled — mirroring the outlined-Alert tint used elsewhere in
 * the send flow — so the off state reads as neutral and the on state as an active perk.
 */
export const ClearMacroRelayOption: FC<ClearMacroRelayOptionProps> = ({
  actionKind,
  network,
}) => {
  const { isEligible, isRelayEnabled, setRelayEnabled } =
    useClearMacroEligibility(actionKind, network);

  if (!isEligible) return null;

  return (
    <Paper
      variant="outlined"
      data-cy="clear-macro-relay-option"
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.5,
        py: 1,
        borderRadius: "12px",
        borderColor: isRelayEnabled
          ? theme.palette.primary.main
          : theme.palette.other.outline,
        backgroundColor: isRelayEnabled
          ? alpha(theme.palette.primary.main, 0.04)
          : "transparent",
        transition: theme.transitions.create([
          "border-color",
          "background-color",
        ]),
      })}
    >
      <Switch
        data-cy="clear-macro-relay-switch"
        size="small"
        checked={isRelayEnabled}
        onChange={(_event, checked) => setRelayEnabled(checked)}
        inputProps={{ "aria-label": "Toggle gasless Clear Macro relay" }}
      />
      <BoltRoundedIcon
        fontSize="small"
        sx={{ color: isRelayEnabled ? "primary.main" : "text.secondary" }}
      />
      <Typography variant="body2" sx={{ flex: 1 }} translate="yes">
        Gasless via Clear Macro relay
      </Typography>
      <TooltipWithIcon title="Instead of a regular transaction, you sign one human-readable message and a relay service submits the transaction and pays the gas." />
    </Paper>
  );
};
