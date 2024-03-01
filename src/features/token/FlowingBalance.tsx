import { Box } from "@mui/material";
import { memo, ReactElement } from "react";
import Amount from "./Amount";
import useEtherSignificantFlowingDecimal from "./useEtherSignificantFlowingDecimal";
import useFlowingBalance from "./useFlowingBalance";
import { BigNumberish } from "ethers";

export interface FlowingBalanceProps {
  balance: BigNumberish;
  /**
   * Timestamp in seconds.
   */
  balanceTimestamp: number;
  flowRate: BigNumberish;
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
