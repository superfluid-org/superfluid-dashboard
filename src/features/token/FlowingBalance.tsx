import { memo, ReactElement, useEffect, useMemo, useState } from "react";
import { BigNumberish, BigNumber, utils } from "ethers";
import { Box } from "@mui/material";
import Amount from "./Amount";
import { useStateWithDep } from "../../useStateWithDep";
import Decimal from "decimal.js";
import useFlowingBalance from "./useFlowingBalance";
import useEtherSignificantFlowingDecimal from "./useEtherSignificantFlowingDecimal";

// Keep it below a second.
const ANIMATION_MINIMUM_STEP_TIME = 75;

export interface FlowingBalanceProps {
  balance: string;
  /**
   * Timestamp in seconds.
   */
  balanceTimestamp: number;
  flowRate: string;
  disableRoundingIndicator?: boolean;
  tokenSymbol?: string;
}

export default memo(function FlowingBalance({
  balance,
  balanceTimestamp,
  flowRate,
  tokenSymbol,
}: FlowingBalanceProps): ReactElement {
  const { weiValue } = useFlowingBalance(balance, balanceTimestamp, flowRate);

  const decimalPlaces = useEtherSignificantFlowingDecimal(flowRate);

  return (
    <Box
      component="span"
      sx={{
        textOverflow: "ellipsis",
      }}
      data-cy={"balance"}
    >
      <Amount wei={weiValue} decimalPlaces={decimalPlaces} /> {tokenSymbol}
    </Box>
  );
});
