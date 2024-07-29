import { Box, Skeleton } from "@mui/material";
import { FC, memo, ReactElement } from "react";
import Amount from "./Amount";
import useEtherSignificantFlowingDecimal from "./useEtherSignificantFlowingDecimal";
import useFlowingBalance from "./useFlowingBalance";
import { BigNumberish } from "ethers";

type FlowingBalanceData = 
  {
    balance: BigNumberish;
    /**
     * Timestamp in seconds.
     */
    balanceTimestamp: number;
    flowRate: BigNumberish;
    tokenSymbol?: string;
  }

export type FlowingBalanceProps = FlowingBalanceData | {
  data: FlowingBalanceData | undefined
}

export default memo(function FlowingBalance({
  ...props
}: FlowingBalanceProps): ReactElement {
  const data = "data" in props ? props.data : props;

  return (
    <Box
      component="span"
      sx={{
        textOverflow: "ellipsis",
      }}
      data-cy={"balance"}
    >
      {data ? <FlowingBalanceCore {...data} /> : <Skeleton />}
    </Box>
  );
});

const FlowingBalanceCore: FC<FlowingBalanceData> = ({ balance, balanceTimestamp, flowRate, tokenSymbol }) => {
  const { weiValue } = useFlowingBalance(balance, balanceTimestamp, flowRate);
  const decimalPlaces = useEtherSignificantFlowingDecimal(flowRate);

  return <Amount wei={weiValue} decimalPlaces={decimalPlaces}> {tokenSymbol}</Amount>;
}
