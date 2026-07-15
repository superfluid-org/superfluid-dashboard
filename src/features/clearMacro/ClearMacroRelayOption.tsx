import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import {
  Chip,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FC, useEffect } from "react";
import { formatUnits, Hex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import TooltipWithIcon from "../common/TooltipWithIcon";
import { Network } from "../network/networks";
import ConnectionBoundary from "../transactionBoundary/ConnectionBoundary";
import { TransactionBoundary } from "../transactionBoundary/TransactionBoundary";
import { TransactionButton } from "../transactionBoundary/TransactionButton";
import { ClearMacroActionKind } from "./dashboardClearMacro";
import { useApproveUsdcForPermit2 } from "./useApproveUsdcForPermit2";
import { useClearMacroEligibility } from "./useClearMacroEligibility";
import { useClearMacroUsdcFeePayment } from "./useClearMacroUsdcFeePayment";
import { ScheduleFlowQuoteAction } from "./useRelayFee";

interface ClearMacroRelayOptionProps {
  /** The macro action this form's primary button maps to; `undefined` = not eligible. */
  actionKind: ClearMacroActionKind | undefined;
  network: Network;
  /**
   * The primary action is forced through the relay on this network (scheduler-touching
   * submit — the fee pays for the scheduling service) and its button stays disabled
   * until the toggle is on; while off, the strip takes a warning state that says so.
   * Only pass when the strip represents the primary action (not a cancel fallback).
   */
  relayRequired?: boolean;
  /**
   * The ScheduleFlow shape to quote the exact fee with (only meaningful with
   * `actionKind === "scheduleFlow"`); without it the fee shows the worst-case
   * "up to" placeholder.
   */
  scheduleAction?: ScheduleFlowQuoteAction;
}

/** Super Tokens are always 18 decimals. */
const SUPER_TOKEN_DECIMALS = 18;

const formatBalance = (wei: bigint, decimals: number) =>
  Number(formatUnits(wei, decimals)).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

const feeChipSx = {
  height: 20,
  "& .MuiChip-label": { px: 1, fontSize: "0.75rem" },
} as const;

/**
 * One fee-token choice as a compact chip: the chosen chip is filled (error-colored
 * when its balance can't cover the fee) and carries its balance inline; the unchosen
 * chip is outlined, dimmed, and shows its balance in a tooltip instead.
 */
const FeeTokenChip: FC<{
  selected: boolean;
  symbol: string;
  balanceText: string | null;
  insufficient: boolean;
  disabled: boolean;
  dataCy: string;
  onSelect: () => void;
}> = ({ selected, symbol, balanceText, insufficient, disabled, dataCy, onSelect }) => (
  <Tooltip
    title={
      !selected && balanceText != null ? (
        <>
          Balance: <span translate="no">{balanceText}</span>
        </>
      ) : (
        ""
      )
    }
    disableInteractive
  >
    {/* span keeps the tooltip working while the chip is disabled */}
    <span>
      {/* `clickable` stays on even when selected so both chips keep a focusable
          ButtonBase root — otherwise the chosen chip degrades to a plain div and
          keyboard focus is lost the moment a chip becomes selected. The onClick
          guard (not `clickable`) is what makes the chosen chip a no-op. */}
      <Chip
        data-cy={dataCy}
        aria-pressed={selected}
        aria-disabled={disabled || undefined}
        aria-label={
          balanceText != null ? `${symbol}, balance ${balanceText}` : symbol
        }
        size="small"
        clickable
        disabled={disabled}
        label={
          <span translate="no">
            {selected && balanceText != null
              ? `${symbol} · ${balanceText}`
              : symbol}
          </span>
        }
        color={selected ? (insufficient ? "error" : "primary") : undefined}
        variant={selected ? "filled" : "outlined"}
        onClick={selected ? undefined : onSelect}
        sx={
          selected
            ? feeChipSx
            : { ...feeChipSx, color: "text.secondary", borderColor: "divider" }
        }
      />
    </span>
  </Tooltip>
);

/**
 * The form-level pre-click signal for the Clear Macro relay path: shows next to the
 * primary `TransactionButton` of macro-eligible forms only, and flips the persisted
 * preference. Renders nothing when the relay cannot engage (network/wallet/action).
 *
 * When the provider supports the Permit2 path and the fee token's underlying (USDC)
 * resolves, the strip also carries the fee-payment selector — a single "Pay fee with"
 * row of compact token chips (the chosen one shows its balance inline): pay from USDCx
 * directly, or fund the fee from USDC (wrapped just-in-time by the forwarder — still
 * one signature, after a one-time USDC→Permit2 approval offered inline).
 *
 * Visually it's an outlined "perk" strip that only takes on the primary accent (border,
 * faint fill, bolt) while enabled — mirroring the outlined-Alert tint used elsewhere in
 * the send flow — so the off state reads as neutral and the on state as an active perk.
 * When the relay is required but still off (`relayRequired`), the strip takes a warning
 * accent instead — amber border and faint amber fill with a red call-to-action line — so
 * the blocker is visible before the user reaches the disabled submit button.
 */
export const ClearMacroRelayOption: FC<ClearMacroRelayOptionProps> = ({
  actionKind,
  network,
  relayRequired,
  scheduleAction,
}) => {
  const { isEligible, isRelayEnabled, setRelayEnabled } =
    useClearMacroEligibility(actionKind, network);
  const {
    fee,
    paymentMode,
    setPaymentMode,
    canPayWithUsdc,
    isCapabilitiesPending,
    usdcxBalanceWei,
    usdcBalanceWei,
    usdcxShortfall,
    needsApproval,
    usdcInsufficient,
    refetchAllowance,
  } = useClearMacroUsdcFeePayment(network, actionKind, scheduleAction);
  const [approveTrigger, approveResult] = useApproveUsdcForPermit2();

  // The approve write resolves on SUBMISSION (hash), not confirmation — the allowance only
  // changes once the receipt lands, so refetch then (not in the trigger's `.then`, which
  // would race the pending transaction and re-read the old allowance).
  const approveHash = approveResult.data?.hash as Hex | undefined;
  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    chainId: network.id,
    hash: approveHash,
  });
  useEffect(() => {
    if (isApproveConfirmed) refetchAllowance();
  }, [isApproveConfirmed, refetchAllowance]);

  if (!isEligible) return null;

  const underlyingSymbol = fee.underlyingSymbol ?? "USDC";
  const isUsdcSelected = paymentMode === "usdc-permit2";
  // Keep a persisted USDC selection visible (disabled) while the capabilities fetch is
  // still pending: the executor resolves capabilities independently, so a fast click in
  // that window can already take the Permit2 path — the chip must not hide the active mode.
  const isUsdcSelectionTentative =
    isUsdcSelected && isCapabilitiesPending && fee.underlyingAddress != null;
  const showPaymentSelector =
    isRelayEnabled &&
    fee.feeAvailable &&
    (canPayWithUsdc || isUsdcSelectionTentative);

  // `feeText` already carries the token symbol (e.g. "0.1 USDCx" or "up to 0.5 USDCx").
  // While a schedule quote is loading/unquotable the text is the worst-case placeholder,
  // so the sentence must not read as an exact, already-quoted amount.
  const isFeePlaceholder = actionKind === "scheduleFlow" && !fee.isQuoteExact;
  const tooltip = fee.feeAvailable
    ? `You sign one human-readable message and a relay service submits the transaction and pays the gas. The macro charges ${isFeePlaceholder ? fee.feeText : `a ${fee.feeText} fee`} on success.` +
      (actionKind === "scheduleFlow"
        ? isFeePlaceholder
          ? " The exact fee is quoted from the schedule's dates and current state once the form is complete."
          : " The fee is quoted from the current schedule state; if that changes before the relay executes, the charge follows it (the signed message discloses the amounts)."
        : "") +
      (canPayWithUsdc
        ? ` The fee can be paid from your ${fee.feeSymbol} balance, or funded from ${underlyingSymbol} (wrapped automatically — still one signature, after a one-time unlimited ${underlyingSymbol} approval to Permit2).`
        : "")
    : "You sign one human-readable message and a relay service submits the transaction and pays the gas.";

  const showRelayRequiredWarning = Boolean(relayRequired) && !isRelayEnabled;

  return (
    <Paper
      variant="outlined"
      data-cy="clear-macro-relay-option"
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
        px: 1.5,
        py: 1,
        borderRadius: "12px",
        borderColor: isRelayEnabled
          ? theme.palette.primary.main
          : showRelayRequiredWarning
            ? theme.palette.warning.main
            : theme.palette.other.outline,
        backgroundColor: isRelayEnabled
          ? alpha(theme.palette.primary.main, 0.04)
          : showRelayRequiredWarning
            ? alpha(theme.palette.warning.main, 0.05)
            : "transparent",
        transition: theme.transitions.create([
          "border-color",
          "background-color",
        ]),
      })}
    >
      <Stack direction="row" alignItems="center" gap={1}>
        <Switch
          data-cy="clear-macro-relay-switch"
          size="small"
          checked={isRelayEnabled}
          onChange={(_event, checked) => setRelayEnabled(checked)}
          inputProps={{ "aria-label": "Toggle Clear Macro relay" }}
        />
        <BoltRoundedIcon
          fontSize="small"
          sx={{ color: isRelayEnabled ? "primary.main" : "text.secondary" }}
        />
        <Stack sx={{ flex: 1 }}>
          <Typography variant="body2" translate="yes">
            Relay pays gas via Clear Macro
          </Typography>
          {fee.feeAvailable && (
            <Typography variant="caption" color="text.secondary" translate="no">
              Fee: {fee.feeText}
            </Typography>
          )}
          {showRelayRequiredWarning && (
            <Typography
              data-cy="clear-macro-relay-required"
              variant="caption"
              color="error.main"
              translate="yes"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <ErrorOutlineRoundedIcon sx={{ fontSize: 14 }} />
              Turn on to schedule streams on {network.name}.
            </Typography>
          )}
        </Stack>
        <TooltipWithIcon title={tooltip} />
      </Stack>

      {showPaymentSelector && (
        <Stack gap={1} data-cy="clear-macro-payment-selector">
          <Stack
            direction="row"
            alignItems="center"
            gap={0.75}
            role="group"
            aria-label="Relay fee payment method"
          >
            <Typography
              variant="caption"
              color="text.secondary"
              translate="yes"
              sx={{ whiteSpace: "nowrap" }}
            >
              Pay fee with
            </Typography>
            <FeeTokenChip
              selected={!isUsdcSelected}
              symbol={fee.feeSymbol ?? "USDCx"}
              balanceText={
                usdcxBalanceWei != null
                  ? formatBalance(usdcxBalanceWei, SUPER_TOKEN_DECIMALS)
                  : null
              }
              insufficient={usdcxShortfall}
              disabled={isUsdcSelectionTentative}
              dataCy="clear-macro-pay-with-usdcx"
              onSelect={() => setPaymentMode("usdcx-direct")}
            />
            <FeeTokenChip
              selected={isUsdcSelected}
              symbol={underlyingSymbol}
              balanceText={
                usdcBalanceWei != null && fee.underlyingDecimals != null
                  ? formatBalance(usdcBalanceWei, fee.underlyingDecimals)
                  : null
              }
              insufficient={usdcInsufficient}
              disabled={isUsdcSelectionTentative}
              dataCy="clear-macro-pay-with-usdc"
              onSelect={() => setPaymentMode("usdc-permit2")}
            />
          </Stack>

          {!isUsdcSelected && usdcxShortfall && (
            <Typography variant="caption" color="error" translate="yes">
              Not enough {fee.feeSymbol} for the relay fee.
            </Typography>
          )}

          {isUsdcSelected && usdcInsufficient && (
            <Typography variant="caption" color="error" translate="yes">
              Not enough {underlyingSymbol} for the relay fee.
            </Typography>
          )}

          {isUsdcSelected && !usdcInsufficient && needsApproval && (
            <ConnectionBoundary expectedNetwork={network}>
              <TransactionBoundary mutationResult={approveResult}>
                {({ setDialogLoadingInfo, txAnalytics }) => (
                  <TransactionButton
                    dataCy="clear-macro-approve-usdc-button"
                    ButtonProps={{
                      size: "small",
                      variant: "outlined",
                      fullWidth: true,
                    }}
                    onClick={async () => {
                      if (!fee.underlyingAddress) return;
                      setDialogLoadingInfo(
                        <Typography
                          variant="h5"
                          color="text.secondary"
                          translate="yes"
                        >
                          You are approving an unlimited{" "}
                          <span translate="no">{underlyingSymbol}</span>{" "}
                          allowance for Permit2 to use — the standard one-time
                          Permit2 setup. Each relay fee still needs a signed
                          permit from you for its exact amount.
                        </Typography>
                      );
                      const primaryArgs = {
                        chainId: network.id,
                        underlyingTokenAddress: fee.underlyingAddress,
                      };
                      // Allowance refetch is receipt-driven (see useWaitForTransactionReceipt
                      // above) — resolving here only means the transaction was submitted.
                      approveTrigger(primaryArgs)
                        .then(...txAnalytics("Approve Allowance", primaryArgs))
                        .catch((error: unknown) => void error); // Already logged and handled in the middleware & UI.
                    }}
                  >
                    Approve {underlyingSymbol} (one time)
                  </TransactionButton>
                )}
              </TransactionBoundary>
            </ConnectionBoundary>
          )}
        </Stack>
      )}
    </Paper>
  );
};
