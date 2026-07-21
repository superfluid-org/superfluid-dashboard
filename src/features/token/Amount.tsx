import Decimal from "decimal.js";
import { BigNumberish, utils } from "ethers";
import { memo, ReactNode } from "react";
import { getDecimalPlacesToRoundTo } from "../../utils/DecimalUtils";
import { Box, SxProps } from "@mui/material";

interface AmountProps {
  wei: BigNumberish;
  /**
   * Defaults to 18 which is what super tokens always have.
   * IMPORTANT: Make sure to pass in this value when you need to display balance of an underlying token and the wei amount was denominated in underlying token's decimals.
   * a.k.a "token decimals", "unit"
   */
  decimals?: number;
  /**
   * a.k.a "fixed" _visible_ decimal places
   */
  decimalPlaces?: number;
  disableRounding?: boolean;
  roundingIndicator?: "..." | "~";
  children?: ReactNode;
  mono?: true;
  /**
   * Insert thousand separators into the integer part, e.g. 2891013 -> 2,891,013.
   * Opt-in: most amounts in the app render without grouping, and some tests
   * assert exact strings.
   */
  groupSeparator?: boolean;
  sx?: SxProps
}

/**
 * Groups the integer digits of an already-formatted amount. Operates only on the
 * leading run of digits so a "~" prefix or "..." suffix is left untouched.
 */
function addGroupSeparators(formatted: string) {
  return formatted.replace(/\d+/, (digits) =>
    digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );
}

export function formatAmount(
  wei: BigNumberish,
  decimals?: number,
  decimalPlaces?: number,
  disableRounding?: boolean,
  roundingIndicator?: "..." | "~",
  groupSeparator?: boolean
) {
  const decimal = new Decimal(utils.formatUnits(wei, decimals));
  const decimalPlacesToRoundTo =
    decimalPlaces ?? getDecimalPlacesToRoundTo(decimal);
  const decimalPlacesToDisplay = decimalPlaces ?? undefined; // "undefined" means that trailing zeroes will be removed by `toFixed`
  const decimalRounded = disableRounding
    ? decimal
    : decimal.toDP(decimalPlacesToRoundTo);
  const isRounded = !decimal.equals(decimalRounded);

  const fixed = decimalRounded.toFixed(decimalPlacesToDisplay);

  return `${isRounded && roundingIndicator === "~" ? "~" : ""}${
    groupSeparator ? addGroupSeparators(fixed) : fixed
  }${isRounded && roundingIndicator === "..." ? "..." : ""}`;
}

// NOTE: Previously known as "EtherFormatted" & "Ether"
export default memo<AmountProps>(function Amount({
  wei,
  decimals = 18,
  disableRounding,
  roundingIndicator,
  children,
  ...props
}) {
  const formattedAmount = formatAmount(
    wei,
    decimals,
    props.decimalPlaces,
    disableRounding,
    roundingIndicator,
    props.groupSeparator
  );

  return (
      <Box component="span" sx={{
        ...(props?.mono ? { fontFamily: 'monospace' } : {}),
        ...(props?.sx ? props.sx : {})
      }} data-cy="token-amount">{formattedAmount}{children}</Box>
  );
});
