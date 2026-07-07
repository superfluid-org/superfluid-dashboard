import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import {
  Paper,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
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

interface ClearMacroRelayOptionProps {
  /** The macro action this form's primary button maps to; `undefined` = not eligible. */
  actionKind: ClearMacroActionKind | undefined;
  network: Network;
}

/** Super Tokens are always 18 decimals. */
const SUPER_TOKEN_DECIMALS = 18;

const formatBalance = (wei: bigint, decimals: number) =>
  Number(formatUnits(wei, decimals)).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  });

/**
 * The form-level pre-click signal for the Clear Macro relay path: shows next to the
 * primary `TransactionButton` of macro-eligible forms only, and flips the persisted
 * preference. Renders nothing when the relay cannot engage (network/wallet/action).
 *
 * When the provider supports the Permit2 path and the fee token's underlying (USDC)
 * resolves, the chip also carries the fee-payment selector: pay from USDCx directly, or
 * fund the fee from USDC (wrapped just-in-time by the forwarder — still one signature,
 * after a one-time USDC→Permit2 approval offered inline).
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
  } = useClearMacroUsdcFeePayment(network, actionKind);
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

  // `feeText` already carries the token symbol (e.g. "0.001 USDCx").
  const tooltip = fee.feeAvailable
    ? `You sign one human-readable message and a relay service submits the transaction and pays the gas. The macro charges a ${fee.feeText} fee on success.` +
      (canPayWithUsdc
        ? ` The fee can be paid from your ${fee.feeSymbol} balance, or funded from ${underlyingSymbol} (wrapped automatically — still one signature, after a one-time approval).`
        : "")
    : "You sign one human-readable message and a relay service submits the transaction and pays the gas.";

  return (
    <Paper
      variant="outlined"
      data-cy="clear-macro-relay-option"
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
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
        </Stack>
        <TooltipWithIcon title={tooltip} />
      </Stack>

      {showPaymentSelector && (
        <Stack gap={1} data-cy="clear-macro-payment-selector">
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="caption" color="text.secondary" translate="yes">
              Pay fee with
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={paymentMode}
              onChange={(_event, mode) => mode && setPaymentMode(mode)}
              aria-label="Relay fee payment method"
              disabled={isUsdcSelectionTentative}
            >
              <ToggleButton
                value="usdcx-direct"
                data-cy="clear-macro-pay-with-usdcx"
                sx={{ px: 1.5, py: 0.25, textTransform: "none" }}
              >
                <Stack alignItems="flex-start">
                  <Typography variant="caption" fontWeight={500} translate="no">
                    {fee.feeSymbol}
                  </Typography>
                  {usdcxBalanceWei != null && (
                    <Typography
                      variant="caption"
                      color={usdcxShortfall ? "error" : "text.secondary"}
                      translate="no"
                    >
                      {formatBalance(usdcxBalanceWei, SUPER_TOKEN_DECIMALS)}
                      {usdcxShortfall && " (insufficient)"}
                    </Typography>
                  )}
                </Stack>
              </ToggleButton>
              <ToggleButton
                value="usdc-permit2"
                data-cy="clear-macro-pay-with-usdc"
                sx={{ px: 1.5, py: 0.25, textTransform: "none" }}
              >
                <Stack alignItems="flex-start">
                  <Typography variant="caption" fontWeight={500} translate="no">
                    {underlyingSymbol}
                  </Typography>
                  {usdcBalanceWei != null && fee.underlyingDecimals != null && (
                    <Typography
                      variant="caption"
                      color={usdcInsufficient ? "error" : "text.secondary"}
                      translate="no"
                    >
                      {formatBalance(usdcBalanceWei, fee.underlyingDecimals)}
                      {usdcInsufficient && " (insufficient)"}
                    </Typography>
                  )}
                </Stack>
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

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
                          You are granting the one-time {underlyingSymbol}{" "}
                          approval that lets the relay fee be funded from{" "}
                          {underlyingSymbol}.
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
